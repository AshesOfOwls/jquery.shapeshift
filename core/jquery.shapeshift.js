;(function ($, window, document, undefined) {

    var pluginName = "shapeshift",
        defaults = {
            // Features
            centerGrid: true,
            enableMultiwidth: true,
            enableResize: true,

            // Grid Properties
            columns: null,
            gutterX: 10,
            gutterY: 10,
            maxColumns: null,
            minColumns: null,
            paddingX: 10,
            paddingY: 10
        };

    function Plugin(element, options) {
      var ss = this;
      ss.options = $.extend({}, defaults, options);

      // Objects
      ss.container = $(element);
      ss.children = null;

      // Arrays
      ss.childAttrs = [];

      // Variables
      ss.child_width = null;
      ss.columns = null;
      ss.column_width = null;
      ss.grid_offset = 0;

      ss.init();
    }

    Plugin.prototype = {
      init: function() {
        var ss = this;
        ss.parseChildren();
        ss.enableFeatures();
        ss.render();
      },

      // Get the properties of the children
      parseChildren: function() {
        var ss = this;
        
        // Creates an array containing the child attributes
        ss.children = ss.container.children();
        ss.childAttrs = []
        for(var i=0;i<ss.children.length;i++) {
          var $child = $(ss.children[i]);
          ss.childAttrs.push({
            colspan: $child.data("ss-colspan") || 1,
            height: $child.innerHeight(),
            width: $child.innerWidth()
          })
        }
      },

      // Enable optional features
      enableFeatures: function() {
        var ss = this,
            options = ss.options;

        if(options.enableResize) { ss.resize(); }
      },

      // Move everything into place
      render: function() {
        var ss = this;
        ss.parseChildren();
        ss.setGridProperties();
        ss.arrange();
      },

      // Calculate child & column dimensions
      setGridProperties: function() {
        var ss = this,
            options = ss.options,
            gutterX = options.gutterX;

        // Detect the single child width
        var child = ss.childAttrs[0],
            child_width = child.width,
            child_colspan = child.colspan;

        ss.child_width = child_width;
        if(child_colspan > 1) {
          var gutter_width = (child_colspan - 1) * gutterX;
          ss.child_width = (child_width - gutter_width) / child_colspan;
        }

        // Columns
        var columns = options.columns,
            container_width = ss.container.width() - (options.paddingX * 2);
        ss.column_width = ss.child_width + gutterX;
        if(!columns) {
          columns = Math.floor(container_width / ss.column_width);

          // Make sure they don't go over or below column limits
          var maxColumns = options.maxColumns,
              minColumns = options.minColumns;
          if(maxColumns && columns > maxColumns) {
            columns = maxColumns;
          } else if(minColumns && columns < minColumns) {
            columns = minColumns;
          }
        }
        ss.columns = columns;

        // Offset for grid centering
        if(ss.options.centerGrid) {
          var grid_width = (ss.columns * ss.column_width) - gutterX;
          ss.grid_offset = (container_width - grid_width) / 2;
        }
      },

      // Physically arrange the items after getting their
      // positions using ss.positions()
      arrange: function() {
        var ss = this,
            positions = ss.getPositions();

        for(var i=0;i<positions.length;i++) {
          var $child = $(ss.children.get(i));
          $child.stop().animate(positions[i], 120)
        }

        ss.container.height(ss.container_height)
      },

      // Calculates the positions of each child element
      getPositions: function() {
        var ss = this,
            options = ss.options,
            positions = [],
            colHeights = [];

        // Create an array to store the column heights
        for(var i=0;i<ss.columns;i++) { colHeights.push(options.paddingY); }

        // Find out the best column and calculate positions
        for(var i=0;i<ss.childAttrs.length;i++) {
          var child = ss.childAttrs[i],
              colspan = child.colspan,
              height = child.height + options.gutterY,
              lowest_col = ss.lowestCol(colHeights),
              offsetX = (lowest_col * ss.column_width) + options.paddingX + ss.grid_offset,
              offsetY = colHeights[lowest_col];

          // If it spans multiple columns, do some stuff
          if(options.enableMultiwidth && colspan > 1) {
            colHeights[lowest_col] += height;
            for(var j=1;j<colspan;j++) {
              colHeights[lowest_col + j] = colHeights[lowest_col];
            }
          } else {
            colHeights[lowest_col] += height;
          }

          positions.push({left: offsetX, top: offsetY});
        }

        // Set the height of the container
        ss.container_height = Math.max.apply(Math,colHeights) + options.paddingY;

        return positions;
      },

      // Determine the index of the lowest number in an array
      lowestCol: function(array, max) {
        if(max) { array = array.slice(0).splice(0,max + 1); };
        return $.inArray(Math.min.apply(window,array), array);
      },

      resize: function() {
        var ss = this,
            resizing = false;

        $(window).on("resize", function() {
          if(!resizing) {
            resizing = true;
            setTimeout(function() {
              resizing = false;
              ss.render();
            }, 75);
          }
        });
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