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
    ss.options = $.extend( {}, defaults, options);
    ss._defaults = defaults;
    ss._name = pluginName;
    ss.containerHeight = 100;
    ss.hoverObjPositions = [];
    ss.init();
  }

  Plugin.prototype.init = function() {
    var ss = this,
        options = ss.options;
    ss.shiftit(options.animated);
    if(options.draggable) { ss.draggable(); }
    if(options.resizable) { ss.resizable(); }
  };

  Plugin.prototype.shiftit = function(animated) {
    var ss = this,
        options = ss.options,
        $container = $(ss.element),
        $objects = $container.children(options.selector).filter(':visible');

    if(!options.draggable) {
      $container.droppable( "destroy" );
      $objects.draggable( "destroy" );
      $objects.droppable( "destroy" );
    }

    // Calculate the positions for each element
    positions = ss.getObjectPositions(':visible');

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
        $container = $(ss.element),
        $objects = $container.children(options.selector).filter(':visible'),
        $selected = null,
        dragging = false;

    $objects.draggable({
      containment: 'document',
      cursor: 'move',
      start: function(e) { dragStart($(this), e) },
      drag: function(e) { dragObject($(this), e); }
    });
    $objects.droppable({ over: function() { enterObject($(this)); } });
    $container.droppable({ drop: function() { dropObject(); } });

    function dragStart($object, e) {
      // Set the selected object
      $selected = $object;
      $selected.addClass("ss-moving");
      ss.setHoverObjPositions();
      ss.shiftit(options.animatedOnDrag);
    }

    function dragObject($object, e) {
      if(!dragging) {
        $objects = $container.children(options.selector).filter(':visible');
        dragging = true;
        intendedIndex = ss.getIntendedIndex($object, e);
        $intendedObj = $($objects.not(".ss-moving").get(intendedIndex));
        $selected.insertBefore($intendedObj);
        ss.shiftit(options.animatedOnDrag);
        window.setTimeout(function() {
          dragging = false;
        }, 200);
      }
    }

    function dropObject() {
      $selected.removeClass("ss-moving");
      ss.shiftit(options.animateOnDrag);
      $container.trigger("shapeshifted");
    }
  }

  Plugin.prototype.getIntendedIndex = function($object, e) {
    var ss = this,
        options = ss.options,
        $container = $(ss.element),
        containerX = $container.offset().left,
        containerY = $container.offset().top,
        objectX = $object.offset().left - containerX,
        objectY = $object.offset().top - containerY + options.gutterY + 10,
        mouseX = e.pageX - containerX,
        mouseY = e.pageY - containerY,
        intentionX = objectX + (mouseX / 2),
        intentionY = objectY + (mouseY / 2),
        shortestDistance = 9999,
        chosenIndex = 0;

    for(hov_i=0;hov_i<ss.hoverObjPositions.length;hov_i++) {
      attributes = ss.hoverObjPositions[hov_i];
      if(intentionX > attributes.left && intentionY > attributes.top) {
        xDist = intentionX - attributes.left;
        yDist = intentionY - attributes.top;
        distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
        if(distance < shortestDistance) {
          shortestDistance = distance;
          chosenIndex = hov_i;
        }
      }
    }
    return chosenIndex;
  }

  Plugin.prototype.setHoverObjPositions = function() {
    var ss = this;
    ss.hoverObjPositions = ss.getObjectPositions(':not(.ss-moving):visible');
  }

  Plugin.prototype.getObjectPositions = function (filter) {
    var ss = this,
        options = ss.options,
        $container = $(ss.element),
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
        resizing = false;

    $(window).on("resize", function() {
      if(!resizing) {
        resizing = true;
        ss.shiftit(options.animated);
        setTimeout(function() {
          resizing = false;
          ss.shiftit(options.animated);
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