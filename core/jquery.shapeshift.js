;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "shapeshift",
        defaults = {
            centerGrid: true,
            enableResize: true,

            columns: null,
            containerHeight: null,
            containerMinHeight: 100,
            gutterX: 10,
            gutterY: 10,
            paddingX: 20,
            paddingY: 0
        };

    // The actual plugin constructor
    function Plugin(element, options) {
      var ss = this;

      ss.container = $(element);
      ss.options = $.extend({}, defaults, options);
      ss.init();
    }

    Plugin.prototype = {

      init: function() {
        var ss = this;

        ss.setGlobals();
        ss.setEvents();
        ss.arrange();
      },

      render: function() {
        var ss = this;
        ss.setGlobals();
        ss.arrange();
      },

      setGlobals: function() {
        var ss = this,
            options = ss.options,
            $container = ss.container;

 
        // Set the Active Children
        var $children = ss.activeChildren = $container.children();

        // The Container Full Width
        ss.container_width = $container.innerWidth();

        // The Inner Container Width
        ss.inner_width = ss.container_width - (options.paddingX * 2);

        // The Child width
        ss.child_width = ss.activeChildren.first().outerWidth();

        // The Column width
        ss.col_width = ss.child_width + options.gutterX;

        // The Column count
        var columns = options.columns;
        if(!columns) {
          // Calculate the number of columns
          columns = Math.floor(ss.inner_width / ss.col_width);

          // Columns cannot outnumber actual children
          if(columns > $children.length) {
            columns = $children.length;
          }
        }
        ss.columns = columns;
      },

      setEvents: function() {
        var ss = this,
            options = ss.options;

        if(options.enableResize) {
          ss.resize();
        }

        ss.container.off("ss-event-arrange").on("ss-event-arrange", function() { ss.render(); });
      },

      arrange: function() {
        console.log("arrange")
        var ss = this,
            options = ss.options;


        // Animate / Move each object into place
        var $children = ss.activeChildren,
            positions = ss.getChildPositions();

        for(var i=0;i<positions.length;i++) {
          var $child = $($children[i]);
          $child.css(positions[i]);
        }

        // Set the container height to match the tallest column
        var height = options.containerHeight
        if(!height) {
          height = ss.maxHeight;

          // Cannot go below minimum height
          if(height < options.containerMinHeight) {
            height = options.containerMinHeight;
          }
        }

        ss.container.css("height", height);
      },

      getChildPositions: function() {
        var ss = this,
            options = ss.options;


        // Create an array element for each column, which is then
        // used to store that columns current height.
        var colHeights = [],
            columns = ss.columns;

        for(var i=0;i<columns;i++) {colHeights.push(options.paddingY);}

        // Get properties for the grid_offset
        var $children = ss.activeChildren,
            child_width = ss.child_width,
            col_width = ss.col_width,
            positions = [];

        // Determine the grid offset if centered
        var grid_offset = options.paddingX;
        if(options.centerGrid) {
          grid_offset += (ss.inner_width - ((col_width * columns) - options.gutterX)) / 2
        }

        // Loop over each element and determine what column it fits into
        for(var i=0;i<$children.length;i++) {
          var $child = $($children[i]),
              col = $.inArray(Math.min.apply(window,colHeights), colHeights),
              height = $child.outerHeight(true) + options.gutterY,
              offsetX = (col_width * col) + grid_offset,
              offsetY = colHeights[col],

              // Store the position to animate into place later
              attributes = { left: offsetX, top: offsetY };


          positions[i] = attributes;

          colHeights[col] += height;
        }

        // Store the max height
        ss.maxHeight = Math.max.apply(Math,colHeights) + options.paddingY;

        return positions;
      },

      resize: function() {
        var ss = this,
            resizing = false;

        $(window).on("resize", function() {
          if(!resizing) {
            resizing = true;
            setTimeout(function() {
              resizing = false;
              ss.container.trigger("ss-event-arrange");
            }, 75);
          }
        });
      }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
      return this.each(function () {
        if (!$.data(this, "plugin_" + pluginName)) {
          $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
        }
      });
    };
})( jQuery, window, document );