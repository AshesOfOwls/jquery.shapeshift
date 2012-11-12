;(function ( $, window, undefined ) {
  // Defaults
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        objWidth: 300,
        gutterX: 10,
        gutterY: 10,
        rearrange: true,
        selector: "div",
        adjustContainerHeight: true
      };

  function Plugin( element, options ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype.init = function () {
    var options = this.options;

    // Get our jQuery objects
    var $container = $(this.element),
        $objects = $container.children(options.selector);

    // Set up initial variables
    var columns = 0,
        colHeights = [],
        colWidth = options.objWidth + options.gutterX,
        objPositions = [];

    // Determine how many columns are currently active
    columns = Math.floor($container.innerWidth() / colWidth);

    // Create an array element for each column, which is then
    // used to store that columns current height.
    for(var i=0;i<columns;i++) {colHeights.push(0);}

    // Loop over each element and determine what column it fits into
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $obj = $($objects[obj_i]);

      // Determine the position of this object
      var col = shortestCol(colHeights),
          offsetX = colWidth * col,
          offsetY = colHeights[col];

      attributes = {
        left: offsetX,
        top: offsetY
      };

      // Increase the calculated total height of the current column
      colHeights[col] += $obj.outerHeight(true) + options.gutterY;

      // Store the position to animate into place later
      objPositions[obj_i] = attributes;
    }

    // Animate / Move each object into place
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $object = $($objects[obj_i]),
          attributes = objPositions[obj_i];

      if(options.rearrange) {
        $object.animate(attributes, { queue: false });
      } else {
        $object.css(attributes);
      }
    }

    if (options.adjustContainerHeight) {
      // Set the container height to match the tallest column
      var col = tallestCol(colHeights),
          height = colHeights[col];

      $container.css("height", height);
    }

    // Get the currently shortest column
    function shortestCol(array) {
      var min_height = 99999,
          selected = 0;

      for(i=0;i<array.length;i++) {
        if(array[i] < min_height) {
          min_height = array[i];
          selected = i;
        }
      }
      return selected;
    }

    // Get the currently tallest column
    function tallestCol(array) {
      var max_height = 0,
          selected = 0;

      for(i=0;i<array.length;i++) {
        if(array[i] > max_height) {
          max_height = array[i];
          selected = i;
        }
      }
      return selected;
    }
  };

  // Prevent against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
    });
  }

}(jQuery, window));