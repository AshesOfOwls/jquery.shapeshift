;(function($,window,undefined) {
  // Defaults
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        animated: true,
        animatedOnDrag: true,
        centerGrid: true,
        columns: null,
        draggable: true,
        objWidth: null,
        gutterX: 10,
        gutterY: 10,
        resizable: true,
        selector: ""
      };

  function Plugin(element, options) {
    var ss = this;
    ss.element = element;
    ss.container = ss.currentContainer = $(element);
    ss.options = $.extend( {}, defaults, options);
    ss._defaults = defaults;
    ss._name = pluginName;
    ss.containerHeight = 100;
    ss.hoverObjPositions = [];
    ss.init();
  }

  Plugin.prototype.init = function() {
    var ss = this,
        options = ss.options,
        $container = ss.container;
    ss.shiftit($container, options.animated);
    if(options.draggable) { ss.draggable(); }
    if(options.resizable) { ss.resizable(); }
  };

  Plugin.prototype.shiftit = function($container, animated) {
    var ss = this,
        options = ss.options,
        $objects = $container.children(options.selector).filter(':visible');

      if(!options.draggable) {
        $container.droppable( "destroy" );
        $objects.draggable( "destroy" );
        $objects.droppable( "destroy" );
      }

    // Calculate the positions for each element
    positions = ss.getObjectPositions($container, ':visible');

    // Animate / Move each object into place
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $obj = $($objects[obj_i]),
          attributes = positions[obj_i];

      if(!$obj.hasClass("ss-moving")) {
        if(animated) {
          $obj.stop(true, false).animate(attributes, 250);
        } else {
          $obj.css(attributes);
        }
      }
    }

    // Set the container height to match the tallest column
    $container.css("height", ss.containerHeight);
  }

  Plugin.prototype.draggable = function () {
    var ss = this,
        options = ss.options,
        $container = $currentContainer = ss.container,
        $objects = $container.children(options.selector).filter(':visible'),
        $selected = null,
        dragging = false;

    $objects.draggable({
      containment: 'document',
      cursor: 'move',
      start: function(e) { dragStart($(this), e) },
      drag: function(e, ui) { dragObject(e, ui); }
    });
    $container.droppable({
      drop: function() { dropObject(); },
      over: function(e) { dragOver(e); },
      out: function() {
        window.setTimeout(function() {
          ss.shiftit($container, options.animatedOnDrag);
        }, 200);
      }
    });

    function dragStart($object, e) {
      // Set the selected object
      $selected = $object;
      $selected.addClass("ss-moving");
      ss.setHoverObjPositions($selected.parent());
      ss.shiftit($container, options.animatedOnDrag);
    }

    function dragOver(e) {
      $currentContainer = $(e.target);
      ss.currentContainer = $currentContainer;
      ss.setHoverObjPositions($currentContainer);
    }

    function dragObject(e, ui) {
      // Manually override the elements position
      var offsetX = e.pageX - $(e.target).parent().offset().left;
      var offsetY = e.pageY - $(e.target).parent().offset().top;
      ui.position.left = offsetX - (options.objWidth / 2);
      ui.position.top = offsetY;

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
    }

    function dropObject() {
      $selected = $(".ss-moving");
      $selected.removeClass("ss-moving");
      ss.shiftit($currentContainer, options.animateOnDrag);
      $currentContainer.trigger("shapeshifted", $selected);
    }
  }

  Plugin.prototype.getIntendedIndex = function($selected, e) {
    var ss = this,
        options = ss.options,
        $container = $selected.parent(),
        selectedX = $selected.position().left + (options.objWidth / 2),
        selectedY = $selected.position().top + 10,
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
    var ss = this;
    ss.hoverObjPositions = ss.getObjectPositions($container, ':not(.ss-moving):visible');
  }

  Plugin.prototype.getObjectPositions = function ($container, filter) {
    var ss = this,
        options = ss.options,
        $objects = $container.children(options.selector).filter(filter),
        columns = options.columns,
        colHeights = [],
        colWidth = null,
        gridOffset = 0,
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
    for(var i=0;i<columns;i++) {colHeights.push(0);}

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
    ss.containerHeight = Math.max.apply(Math,colHeights);
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
        }, 100);
      }
    });
  }

  // Prevent against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
    });
  }

}(jQuery, window));