;(function($,window,undefined) {
  // Defaults
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        adjustContainerHeight: true,
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
    ss.objPositions = [];
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
        $objects = $container.children(options.selector).filter(':visible'),
        columns = options.columns,
        colHeights = [],
        colWidth = null,
        gridOffset = 0;

    if(!options.draggable) {
      $container.droppable( "destroy" );
      $objects.draggable( "destroy" );
      $objects.droppable( "destroy" );
    }

    if(!options.objWidth) {
      options.objWidth = $objects.first().outerWidth(true);
    }
    colWidth = options.objWidth + options.gutterX;

    // Determine how many columns are currently active
    if(!columns) { columns = Math.floor($container.innerWidth() / colWidth); }

    if(options.centerGrid) {
      gridOffset = Math.floor((($container.innerWidth() / colWidth) % 1 * colWidth) / 2);
    }

    // Create an array element for each column, which is then
    // used to store that columns current height.
    for(var i=0;i<columns;i++) {colHeights.push(0);}

    // Loop over each element and determine what column it fits into
    for(var obj_i=0;obj_i<$objects.length;obj_i++) {
      var $obj = $($objects[obj_i]),
          col = ss.shortestCol(colHeights),
          height = $obj.outerHeight(true) + options.gutterY,
          offsetX = (colWidth * col) + gridOffset,
          offsetY = colHeights[col];

      // Store the position to animate into place later
      attributes = { left: offsetX, top: offsetY };
      ss.objPositions[obj_i] = attributes;

      // Increase the calculated total height of the current column
      colHeights[col] += height;
    }

    // Animate / Move each object into place
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $obj = $($objects[obj_i]),
          attributes = ss.objPositions[obj_i];

      if(!$obj.hasClass("ss-moving")) {
        if(animated) {
          $obj.stop(true, false).animate(attributes, 250);
        } else {
          $obj.css(attributes);
        }
      }
    }

    // Set the container height to match the tallest column
    if (options.adjustContainerHeight) {
      var col = ss.tallestCol(colHeights),
          height = colHeights[col];
      $container.css("height", height);
    }
  }

  Plugin.prototype.draggable = function () {
    var ss = this,
        options = ss.options,
        $container = $(ss.element),
        $objects = $container.children(options.selector).filter(':visible'),
        $selected = null,
        $hovered = null,
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

    function enterObject($hoveredObj) { $hovered = $hoveredObj; }

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
        mouseX = e.pageX,
        mouseY = e.pageY,
        intentionX = objectX + ((mouseX - objectX) / 2),
        intentionY = objectY + ((mouseY - objectY) / 2),
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
    var ss = this,
        options = ss.options,
        $container = $(ss.element),
        $objects = $container.children(options.selector).filter(':not(.ss-moving):visible'),
        columns = options.columns,
        colHeights = [],
        colWidth = options.objWidth + options.gutterX;

    if(!columns) { columns = Math.floor($container.innerWidth() / colWidth); }

    // Create an array element for each column, which is then
    // used to store that columns current height.
    for(var i=0;i<columns;i++) {colHeights.push(0);}

    // Loop over each element and determine what column it fits into
    for(var obj_i=0;obj_i<$objects.length;obj_i++) {
      var $obj = $($objects[obj_i]),
          col = ss.shortestCol(colHeights),
          height = $obj.outerHeight(true) + options.gutterY,
          offsetX = colWidth * col,
          offsetY = colHeights[col];

      // Store the position to animate into place later
      attributes = { left: offsetX, top: offsetY };
      ss.hoverObjPositions[obj_i] = attributes;

      // Increase the calculated total height of the current column
      colHeights[col] += height;
    }
  }

  Plugin.prototype.setObjectPositions = function () {

  }

  Plugin.prototype.shortestCol = function (array) {
    return $.inArray(Math.min.apply(window,array), array);
  }

  Plugin.prototype.tallestCol = function (array) {
    return $.inArray(Math.max.apply(window,array), array);
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