;(function($,window,undefined) {
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        // Features
        centerGrid: true,
        enableAnimation: true,
        enableAutoHeight: true,
        enableDrag: true,
        enableDragAnimation: true,
        enableRearrange: true,
        enableResize: true,

        // Options
        animateSpeed: 150,
        childWidth: null,
        columns: null,
        dragClone: false,
        dragRate: 100,
        dragWhitelist: "*",
        dropCutoff: 0,
        dropWhitelist: "*",
        gutterX: 10,
        gutterY: 10,
        paddingY: 0,
        paddingX: 0,
        selector: ""
      };

  function Plugin(element, options) {
    var ss = this;
    ss.container = $(element);
    ss.options = $.extend({}, defaults, options);
    ss.init();
  }

  Plugin.prototype.init = function() {
    var ss = this;
    ss.eventSetup();
    ss.container.trigger("ss-event-arrange");
  };

  Plugin.prototype.eventSetup = function() {
    var ss = this,
        options = ss.options;

    ss.container.attr("data-ss-rearrangeable", options.enableRearrange)
    ss.container.off("ss-event-arrange").on("ss-event-arrange", function() { ss.arrange(); });
    ss.container.off("ss-event-dragreset").on("ss-event-dragreset", function() { ss.dragClear(); ss.drag(); });

    ss.dragClear();
    if(options.enableDrag) { ss.drag(); }
    if(options.enableResize) { ss.resize(); }
  }

  Plugin.prototype.arrange = function() {
    var ss = this,
        options = ss.options,
        $objects = ss.container.children(options.selector).filter(':visible'),
        positions = ss.getPositions(ss.container, false),
        positionsLength = positions.length - 1,
        obj_i = positionsLength,
        animated = true;

    if($objects.filter(".ss-moving")[0]) {
      animated = options.enableDragAnimation;
    } else {
      animated = options.enableAnimation;
    }

    // Animate / Move each object into place
    do {
      var reverse_i = positionsLength - obj_i,
          $obj = $($objects[reverse_i]);

      // Never animate the currently dragged item
      if(!$obj.hasClass("ss-moving")) {
        if(animated) {
          $obj.stop(true, false).animate(positions[reverse_i], options.animateSpeed);
        } else {
          $obj.css(positions[reverse_i]);
        }
      }
    } while(obj_i--);

    // Set the container height to match the tallest column
    ss.container.css("height", options.containerHeight);
  }

  Plugin.prototype.drag = function () {
    var ss = this,
        options = ss.options;

    $curContainer = ss.container;

    var $objects = ss.container.children(options.selector),
        $selected = null,
        position = null,
        dragging = false;

    // Dragging
    $objects.filter(options.dragWhitelist).draggable({
      addClasses: false,
      containment: 'document',
      zIndex: 9999,
      drag: function(e, ui) { drag(e, ui); },
      start: function(e, ui) { start(e, ui); },
      stop: function(e, ui) { stop(e); }
    });

    function start(e, ui) {
      $selected = $(e.target);
      if(options.dragClone) {
        $clone = $selected.clone().insertBefore($selected).addClass("ss-clone");
      }
      $selected.addClass("ss-moving");
    }

    function stop(e) {
      $(e.target).removeClass("ss-moving").parent().trigger("ss-event-arrange");
    }

    function drag(e, ui) {
      console.log($curContainer)
      if(!dragging && $curContainer.data("ss-rearrangeable")) {
        dragging = true;
        position = ss.getIntendedPosition(e);
        $objects = $curContainer.children(":not(.ss-moving):visible");
        if(position != $objects.size()) {
          $target = $objects.get(position);
          $selected.insertBefore($target);
        } else {
          $target = $objects.get(position - 1);
          $selected.insertAfter($target);
        }

        $curContainer.trigger("ss-event-arrange");
        $(".ss-prev-container").trigger("ss-event-arrange");

        window.setTimeout(function() {
          dragging = false;
        }, options.dragRate)
      }
      // Manually override the elements position
      ui.position.left = e.pageX - $(e.target).parent().offset().left - (options.childWidth / 2);
      ui.position.top = e.pageY - $(e.target).parent().offset().top - ($selected.outerHeight() / 2);
    }

    // Dropping
    ss.container.droppable({
      accept: options.dropWhitelist,
      drop: function(e) { drop(e); },
      over: function(e) { over(e); }
    });

    function drop(e) {
      $selected = $(".ss-moving").removeClass("ss-moving");
      $selectedContainer = $selected.parent();
      $clone = $(".ss-clone");
      if($clone[0]) {
        $cloneContainer = $clone.parent();
        if($cloneContainer[0] === $selectedContainer[0]) {
          $clone.remove();
        } else {
          $clone.removeClass("ss-clone");
          $cloneContainer.trigger("ss-event-dragreset");
          $selected.parent().trigger("ss-event-dragreset");
        }
      }
      $selectedContainer.trigger("ss-event-arrange").trigger("ss-event-dropped", $selected);
    }

    function over(e) {
      $curContainer.addClass("ss-prev-container");
      $curContainer = $(e.target).removeClass("ss-prev-container");
    }
  }

  Plugin.prototype.dragClear = function() {
    this.container.droppable().droppable('destroy');
    this.container.children().draggable().draggable('destroy');
  }

  Plugin.prototype.getPositions = function($container, ignoreSelected) {
    var ss = this,
        options = ss.options,
        $objects = $container.children(options.selector).filter(":visible"),
        columns = options.columns,
        colHeights = [],
        colWidth = null,
        gridOffset = options.paddingX,
        positions = [];

    // If we want to get the positions for all items excluding the
    // one currently being dragged.
    if(ignoreSelected) { $objects = $objects.not(".ss-moving"); }

    // Determine the width of each element.
    if(!options.childWidth) { options.childWidth = $objects.first().outerWidth(true); }

    // Determine the column width.
    colWidth = options.childWidth + options.gutterX;

    // Determine how many columns are currently active
    if(!columns) { columns = Math.floor($container.innerWidth() / colWidth); }

    // Offset the grid to center it.
    if(options.centerGrid) {
      gridOffset = Math.floor((($container.innerWidth() / colWidth) % 1 * colWidth) / 2) + (options.gutterX / 2);
    }

    // Create an array element for each column, which is then
    // used to store that columns current height.
    for(var i=0;i<columns;i++) {colHeights.push(options.paddingY);}

    // Loop over each element and determine what column it fits into
    for(var obj_i=0;obj_i<$objects.length;obj_i++) {
      var $obj = $($objects[obj_i]),
          col = $.inArray(Math.min.apply(window,colHeights), colHeights),
          height = $obj.outerHeight(true) + options.gutterY,
          offsetX = (colWidth * col) + gridOffset,
          offsetY = colHeights[col];

      // Store the position to animate into place later
      attributes = { left: offsetX, top: offsetY };
      positions[obj_i] = attributes;

      // Increase the calculated total height of the current column
      colHeights[col] += height;
    }
    // Store the height of the tallest column
    if(options.enableAutoHeight){
      options.containerHeight = Math.max.apply(Math,colHeights);
    }
    return positions;
  }

  Plugin.prototype.getIntendedPosition = function(e) {
    var ss = this,
        options = ss.options,
        $selected = $(".ss-moving"),
        $container = $selected.parent(),
        chosenIndex = 0,
        selectedX = $selected.position().left + (options.childWidth / 2),
        selectedY = $selected.position().top + ($selected.outerHeight() / 2),
        shortestDistance = 9999,
        positions = ss.getPositions($container, true),
        endCap = positions.length - options.dropCutoff,
        hov_i = positions.length;

    // Go over all of those positions and figure out
    // which is the closest to the cursor.
    do {
      // If we are able to insert at this index position
      if(hov_i < endCap) {
        attributes = positions[hov_i];

        // If the current item is to the bottom right of the current object position
        if(selectedX > attributes.left && selectedY > attributes.top) {
          var xDist = selectedX - attributes.left,
              yDist = selectedY - attributes.top;

          distance = Math.sqrt((xDist * xDist) + (yDist * yDist));

          // If this is the shortest distance so far
          if(distance < shortestDistance) {
            shortestDistance = distance;
            chosenIndex = hov_i;

            // If this is the last item, and we are below it or to the right,
            // then we may want to insert it as the last item.
            if(hov_i === positions.length - 1) {
              var $object = $container.children().not(".ss-moving").last();
              if(yDist > ($object.outerHeight() * .9) || xDist > options.childWidth * .9) {
                chosenIndex++;
              }
            }
          }
        }
      }
    } while(hov_i--);
    // Return the intended index position
    return chosenIndex;
  }

  Plugin.prototype.resize = function () {
    var ss = this,
        resizing = false;

    $(window).on("resize", function() {
      if(!resizing) {
        resizing = true;
        ss.container.trigger("ss-event-arrange");
        setTimeout(function() {
          resizing = false;
        }, 200);
      }
    });
  }

  // Prevent against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
    });
  }

}(jQuery, window));