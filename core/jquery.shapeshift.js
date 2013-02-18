;(function ($, window, document, undefined) {

    var pluginName = "shapeshift",
        defaults = {
          gutterX: 10,
          gutterY: 10,
          paddingX: 10,
          paddingY: 10
        };

    function Plugin(element, options) {
      var ss = this;
      ss.options = $.extend({}, defaults, options);

      // Globals
      ss.container = $(element);
      ss.children = ss.container.children();
      ss.grid_height = 100;

      ss.init();
    }

    Plugin.prototype = {
      init: function() {
        var ss = this;

        ss.arrange();
      },

      arrange: function() {
        var ss = this,
            $container = ss.container,
            $children = $container.children(),
            positions = ss.getPositions();

        for(var i=0;i<positions.length;i++) {
          var $child = $children.eq(i);
          $child.animate(positions[i])
        }

        $container.height(ss.grid_height)
      },

      getPositions: function() {
        var ss = this,
            options = ss.options,
            gutterX = options.gutterX,
            gutterY = options.gutterY,
            paddingX = options.paddingX,
            paddingY = options.paddingY;

        // Get DOM properties
        var $container = ss.container,
            $children = $container.children(),
            container_width = $container.innerWidth() - (paddingX * 2),
            child_width = $children.first().outerWidth(true),
            col_width = child_width + options.gutterX,
            columns = Math.floor((container_width + gutterX) / col_width);

        // Store our column heights
        var col_heights = [];
        for(var i=0;i<columns;i++) { col_heights.push(paddingY); }

        // Calculate the child positions
        var positions = [];
        for(var i=0;i<$children.length;i++) {
          var $child = $children.eq(i),
              col = ss.lowestCol(col_heights),
              offsetX = col * col_width + paddingX,
              offsetY = col_heights[col];

          col_heights[col] += $child.height() + gutterY;

          positions.push({marginLeft: offsetX, marginTop: offsetY});
        }

        // Store the grid height
        var grid_height = col_heights[ss.highestCol(col_heights)]
        ss.grid_height = grid_height - gutterY + paddingY;

        return positions;
      },

      lowestCol: function(array) {
        return $.inArray(Math.min.apply(window,array), array);
      },

      highestCol: function(array) {
        return $.inArray(Math.max.apply(window,array), array);
      }
    };

    $.fn[pluginName] = function (options) {
      return this.each(function () {
        if (!$.data(this, "plugin_" + pluginName)) {
          $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
        }
      });
    };

})( jQuery, window, document );