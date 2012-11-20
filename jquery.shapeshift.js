;(function($,window,undefined) {
  // Defaults
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        animated: true,
        animatedOnDrag: true,
        autoContainerHeight: true,
        centerGrid: true,
        columns: null,
        disableDragOn: "",
        draggable: true,
        gutterX: 10,
        gutterY: 10,
        objWidth: null,
        paddingY: 0,
        paddingX: 0,
        resizable: true,
        selector: ""
      };

  function Plugin(element, options) {
    var ss = this;
    ss.element = element;
    ss.container = $(element);
    ss.options = $.extend({}, defaults, options);
    ss.hoverObjPositions = [];
    ss.init();
  }

  Plugin.prototype.init = function() {
    var ss = this,
        options = ss.options;
    ss.shiftit(ss.container, options.animated);
    if(options.draggable) { ss.draggable(); }
    if(options.resizable) { ss.resizable(); }
  };

  Plugin.prototype.shiftit = function($container, animated) {
    var ss = this,
        options = ss.options,
        $objects = $container.children(options.selector).filter(':visible');

    // Destroy draggable/droppable if needed
    if(!options.draggable) {
      $container.droppable("destroy");
      $objects.draggable("destroy");
    }

    // Calculate the positions for each element
    positions = ss.getObjectPositions($container, ':visible');

    // Animate / Move each object into place
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $obj = $($objects[obj_i]),
          attributes = positions[obj_i];

      // Never animate the currently dragged item
      if(!$obj.hasClass("ss-moving")) {
        if(animated) {
          $obj.stop(true, false).animate(attributes, 250);
        } else {
          $obj.css(attributes);
        }
      }
    }

    // Set the container height to match the tallest column
    $container.css("height", options.containerHeight);
  }

  Plugin.prototype.draggable = function () {
    var ss = this,
        options = ss.options,
        $container = $currentContainer = $previousContainer = ss.container,
        $objects = $container.children(options.selector),
        $selected = null,
        dragging = false;

    // Initialize the jQuery UI Draggable/Droppable
    $objects.filter(":not("+options.disableDragOn+")").draggable({
      containment: 'document',
      start: function() { dragStart($(this)); },
      drag: function(e, ui) { dragObject(e, ui); }
    });
    $container.droppable({
      drop: function() { dropObject(); },
      over: function(e) { dragOver(e); },
      out: function() { dragOut(); }
    });

    // When an object is picked up
    function dragStart($object) {
      $selected = $object.addClass("ss-moving");
      ss.shiftit($container, options.animatedOnDrag);
    }

    // When an object is dragged around
    function dragObject(e, ui) {
      if(!dragging) {
        dragging = true;
        $objects = $currentContainer.children(options.selector).filter(':visible');

        var intendedIndex = ss.getIntendedIndex($selected, e),
            $intendedObj = $($objects.not(".ss-moving").get(intendedIndex));
        $selected.insertBefore($intendedObj);
        ss.shiftit($currentContainer, options.animatedOnDrag);

        // Prevent it from firing too much
        window.setTimeout(function() {
          dragging = false;
        }, 200);
      }

      // Manually override the elements position
      var offsetX = e.pageX - $(e.target).parent().offset().left - (options.objWidth / 2),
          offsetY = e.pageY - $(e.target).parent().offset().top - ($selected.outerHeight() / 2);
      ui.position.left = offsetX;
      ui.position.top = offsetY;
    }

    // When an object is dropped
    function dropObject() {
      $selected = $(".ss-moving").removeClass("ss-moving");
      ss.shiftit($currentContainer, options.animateOnDrag);
      $currentContainer.trigger("shapeshifted", $selected);
    }

    // When an object moves to a new container
    function dragOver(e) {
      $currentContainer = $(e.target);
      ss.setHoverObjPositions($currentContainer);
      window.setTimeout(function() {
        ss.shiftit($previousContainer, options.animatedOnDrag);
      }, 300);
    }

    // When an object moves out of its current container
    function dragOut(e) {
      $previousContainer = $container;
      ss.shiftit($container, options.animatedOnDrag);
    }
  }

  Plugin.prototype.getIntendedIndex = function($selected, e) {
    var ss = this,
        options = ss.options,
        $container = $selected.parent(),
        selectedX = $selected.position().left + (options.objWidth / 2),
        selectedY = $selected.position().top + ($selected.outerHeight() / 2),
        shortestDistance = 9999,
        chosenIndex = 0;

    ss.setHoverObjPositions($container);
    for(hov_i=0;hov_i<ss.hoverObjPositions.length;hov_i++) {
      attributes = ss.hoverObjPositions[hov_i];
      if(selectedX > attributes.left && selectedY > attributes.top) {
        xDist = selectedX - attributes.left;
        yDist = selectedY - attributes.top;
        distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
        if(distance < shortestDistance) {
          shortestDistance = distance;
          chosenIndex = hov_i;
        }
      }
    }
    return chosenIndex;
  }

  Plugin.prototype.setHoverObjPositions = function($container) {
    this.hoverObjPositions = this.getObjectPositions($container, ':not(.ss-moving):visible');
  }

  Plugin.prototype.getObjectPositions = function ($container, filter) {
    var options = this.options,
        $objects = $container.children(options.selector).filter(filter),
        columns = options.columns,
        colHeights = [],
        colWidth = null,
        gridOffset = options.paddingX,
        positions = [];

    // Determine the width of each element.
    if(!options.objWidth) { options.objWidth = $objects.first().outerWidth(true); }

    // Determine the column width.
    colWidth = options.objWidth + options.gutterX;

    // Determine how many columns are currently active
    if(!columns) { columns = Math.floor($container.innerWidth() / colWidth); }

    // Offset the grid to center it.
    if(options.centerGrid) {
      gridOffset = Math.floor((($container.innerWidth() / colWidth) % 1 * colWidth) / 2);
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
    if(options.autoContainerHeight){
      options.containerHeight = Math.max.apply(Math,colHeights);
    }
    return positions;
  }

  Plugin.prototype.resizable = function () {
    var ss = this,
        options = ss.options,
        $container = ss.container,
        resizing = false;

    $(window).on("resize", function() {
      if(!resizing) {
        resizing = true;
        ss.shiftit($container, options.animated);
        setTimeout(function() {
          resizing = false;
          ss.shiftit($container, options.animated);
        }, 333);
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