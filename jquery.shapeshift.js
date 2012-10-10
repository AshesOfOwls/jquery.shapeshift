;(function ( $, window, undefined ) {
  // Defaults
  var pluginName = 'shapeshift';
  var document = window.document;
  var defaults = {
        selector: "div",
        colWidth: 300,
        gutterX: 10,
        gutterY: 10,
        rearrange: true
      };

  function Plugin( element, options ) {
    this.element = element;

    this.options = $.extend( {}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  Plugin.prototype.init = function () {
    console.time('test 1');

    var $container = $(this.element),
        $objects = $container.children(this.options.selector),
        col_total = 0,
        col_heights = [],
        col_width = this.options.colWidth + this.options.gutterX,
        adjust_container_height = $container.data("shapeshift_resize"),
        options = this.options;

    if ("undefined" === typeof adjust_container_height) {
      adjust_container_height = true;
    }

    // Determine how many columns are available
    col_total = Math.floor($container.innerWidth() / col_width);

    // Create an array storing the height that each column has reached
    for(i=0;i<col_total;i++) {col_heights.push(0);}

    $objects.each(function(i) {
      $this = $(this);
      var col = shortestCol(col_heights),
          child_width_span = Math.floor($(this).innerWidth() / options.colWidth);
          offsetX = col_width * col,
          offsetY = col_heights[col];

      // Add this child to the column heights
      this_height = $this.outerHeight(true) + options.gutterY;
      col_heights[col] += this_height;

      // If this is a double wide col, update the second col
      if(child_width_span > 1) {
        col_heights[col + 1] += this_height;
      }

      // Set the child position
      attributes = {
        left: offsetX,
        top: offsetY
      }
      if(options.rearrange) {
        $this.animate(attributes, { queue: false });
      } else {
        $this.css(attributes);
      }
      $this.trigger("shapeshifted");

      // Set the container height to match the tallest column
      col = tallestCol(col_heights);

      $container.data("max-height", col_heights[col]);

      if (adjust_container_height) {
        $container.css("height", col_heights[col]);
      }
    });

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

    console.timeEnd('test 1');
  };

  // Prevent against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    var array = this.toArray();
    for(i=0; i < this.length; i++) {
      $.data(array[i], 'plugin_' + pluginName, new Plugin(this, options));
    }
  }

}(jQuery, window));
