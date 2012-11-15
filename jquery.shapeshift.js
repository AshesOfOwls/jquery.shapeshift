;(function ( $, window, undefined ) {
  // Defaults
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        adjustContainerHeight: true,
        animated: true,
        draggable: true,
        objWidth: 300,
        gutterX: 10,
        gutterY: 10,
        resizable: true,
        selector: "div"
      };

  function Plugin( element, options ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.objPositions = [];
    this.init();
  }

  Plugin.prototype.init = function () {
    this.shiftit();
    if(this.options.draggable) { this.draggable(); }
    if(this.options.resizable) { this.resizable(); }
  };

  Plugin.prototype.shiftit = function (not_object) {
    var options = this.options,
        ss = this;

    var $container = $(ss.element),
        $objects = $container.children(options.selector).not(not_object),
        columns = 0,
        colHeights = [],
        colWidth = options.objWidth + options.gutterX;

    // Determine how many columns are currently active
    columns = Math.floor($container.innerWidth() / colWidth);

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

      if(!$obj.hasClass("moving")) {
        // Store the position to animate into place later
        attributes = { left: offsetX, top: offsetY };
        ss.objPositions[obj_i] = attributes;

        // Increase the calculated total height of the current column
        colHeights[col] += height;
      }
    }

    // Animate / Move each object into place
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $obj = $($objects[obj_i]),
          attributes = ss.objPositions[obj_i];

      if(!$obj.hasClass("moving")) {
        if(options.animated) {
          $obj.stop(true, false).animate(attributes);
        } else {
          $obj.css(attributes);
        }
      }
      $obj.html(obj_i); // TEMPORARY to see objects current index
    }

    // Set the container height to match the tallest column
    if (options.adjustContainerHeight) {
      var col = ss.tallestCol(colHeights),
          height = colHeights[col];
      $container.css("height", height);
    }
  }

  Plugin.prototype.draggable = function () {
    var options = this.options,
        ss = this;

    // Get our jQuery objects
    var $container = $(this.element),
        $objects = $container.children(options.selector);

    // Set some initial global variables
    var $selected = null,
        $hovered = null,
        dragging = false;

    $objects.draggable({
      start: function(e) { dragStart($(this), e) },
      drag: function() { dragObject(); }
    });
    $objects.droppable({
      over: function() { enterObject($(this)); },
      out: function() { leaveObject(); }
    });
    $container.droppable({ drop: function() { dropObject(); } });

    function dragStart($object, e) {
      // Set the selected object
      $selected = $object;
      $selected.addClass("moving");
      ss.shiftit();
    }

    function dragObject(e) {
      if(!dragging) {
        dragging = true;
        window.setTimeout(function() {
          dragging = false;
        }, 300);
      }
    }

    function enterObject($hoveredObj) {
      $hovered = $hoveredObj;
      $objects.removeClass("over");
      $hovered.addClass("over");
    }

    function leaveObject() {
      $hovered.removeClass("over")
    }

    function dropObject() {
      $objects.removeClass("over");
      $selected.removeClass("moving");
      $selected.insertBefore($hovered);
      ss.shiftit();
    }

    function getIntendedIndex(e) {

    }
  }

  Plugin.prototype.shortestCol = function (array) {
    return array.indexOf(Math.min.apply(window,array));
  }

  Plugin.prototype.tallestCol = function (array) {
    return array.indexOf(Math.max.apply(window,array));
  }

  Plugin.prototype.resizable = function () {
    var ss = this,
        resizing = false;

    $(window).on("resize", function() {
      if(!resizing) {
        resizing = true;
        ss.shiftit();
        setTimeout(function() {
          resizing = false;
          ss.shiftit();
        }, 333);
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