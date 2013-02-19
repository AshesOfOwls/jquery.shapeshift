;(function ($, window, document, undefined) {

    var pluginName = "shapeshift",
        defaults = {
          // Grid Properties
          autoHeight: true,
          centerGrid: true,
          columns: null,
          gutterX: 10,
          gutterY: 10,
          height: null,
          maxHeight: null,
          minHeight: 100,
          paddingX: 10,
          paddingY: 10,

          // Others
          animateSpeed: 150,

          // Features
          enableAnimation: true,
          enableAnimationOnInit: false,
          enableResize: true
        };

    function Plugin(element, options) {
      var ss = this;
      ss.options = $.extend({}, defaults, options);

      // Set Globals
      ss.container = $(element);
      ss.container_height = 100;
      ss.animate = false;

      ss.init();
    }

    Plugin.prototype = {

      // --------------------
      // Setup
      // --------------------

      init: function() {
        var ss = this;

        ss.detectDependencies();

        ss.enableFeatures();
        ss.createEvents();
        ss.render();

        ss.afterInit();
      },

      detectDependencies: function() {
        var ss = this;
      },

      enableFeatures: function() {
        var ss = this,
            options = ss.options;

        if(options.enableResize) { ss.resize(); }
        if(options.enableAnimation && options.enableAnimationOnInit) { ss.animate = true; }
      },

      createEvents: function() {
        var ss = this;

        ss.container.off("ss-arrange").on("ss-arrange", function() { ss.render(); });
        ss.container.off("ss-destroy").on("ss-destroy", function() { ss.destroy(); });
      },

      render: function() {
        var ss = this;

        ss.arrange();
      },

      afterInit: function() {
        var ss = this,
            options = ss.options;

        // Re-enable animation if it was canceled on init
        if(options.enableAnimation) { ss.animate = true; }
      },

      // --------------------
      // Core Shapeshift
      // --------------------

      // Physically move the child elements into
      // their determined positions.
      arrange: function() {
        var ss = this,
            options = ss.options,
            $container = ss.container,
            $children = $container.children(":visible"),
            positions = ss.getPositions(),
            animate = ss.animate,
            animateSpeed = options.animateSpeed;

        for(var i=0;i<positions.length;i++) {
          var $child = $children.eq(i);

          if(animate) {
            $child.stop(true, false).animate(positions[i], animateSpeed);
          } else {
            $child.css(positions[i]);
          }
        }

        // Set the container height
        if(ss.options.autoHeight) {
          var height = options.height;

          if(height) {
              $container.height(height);
          } else {
            var container_height = ss.container_height,
                max_height = options.maxHeight,
                min_height = options.minHeight;

            if(min_height && ((container_height < min_height) || (max_height && max_height < min_height))) {
              $container.height(min_height);
            } else if(max_height && container_height > max_height) {
              $container.height(max_height);
            } else {
              $container.height(container_height);
            }
          }
        }
      },

      // Returns an array containing all margin left/top
      // coordinates for each child.
      getPositions: function() {
        var ss = this,
            options = ss.options,
            gutterX = options.gutterX,
            gutterY = options.gutterY,
            paddingX = options.paddingX,
            paddingY = options.paddingY;

        // Get DOM Elements
        var $container = ss.container,
            $children = $container.children(":visible"),
            $first_child = $children.first();

        // Determine proportions
        var container_width = $container.innerWidth() - (paddingX * 2),
            fc_width = $children.first().innerWidth(),
            fc_colspan = $first_child.data("ss-colspan"),
            child_width = (fc_width - (gutterX * (fc_colspan - 1))) / fc_colspan,
            col_width = child_width + gutterX,
            columns = options.columns || Math.floor((container_width + gutterX) / col_width);

        // Determine offset
        var offset = 0;
        if(options.centerGrid) {
          var grid_width = (columns * col_width) - gutterX;
          offset = (container_width - grid_width) / 2
        }

        // Store our column heights
        var col_heights = [];
        for(var i=0;i<columns;i++) { col_heights.push(paddingY); }

        // Calculate the child positions
        var positions = [];
        for(var i=0;i<$children.length;i++) {
          var $child = $children.eq(i),
              colspan = $child.data("ss-colspan"),
              col = ss.lowestCol(col_heights, colspan),
              offsetX = (col * col_width) + paddingX + offset,
              offsetY = col_heights[col];

          col_heights[col] += $child.height() + gutterY;

          // Multiwidth
          if(colspan > 1) {
            for(var j=1;j<colspan;j++) {
              col_heights[col + j] = col_heights[col];
            }
          }

          positions.push({left: offsetX, top: offsetY});
        }

        // Store the grid height
        var grid_height = col_heights[ss.highestCol(col_heights)]
        ss.container_height = grid_height - gutterY + paddingY;

        return positions;
      },

      // --------------------
      // Features
      // --------------------

      // Listens to the resize event and then triggers
      // the arrange even on the container.
      resize: function () {
        var ss = this,
            resizing = false,
            animateSpeed = ss.options.animateSpeed;

        $(window).on("resize.shapeshift", function() {
          if(!resizing) {
            resizing = true;

            setTimeout(function() { ss.container.trigger("ss-arrange"); }, animateSpeed / 2);
            setTimeout(function() { ss.container.trigger("ss-arrange"); }, animateSpeed);

            setTimeout(function() {
              ss.container.trigger("ss-arrange");
              resizing = false;
            }, animateSpeed * 1.5);
          }
        });
      },

      // --------------------
      // Helper Functions
      // --------------------

      lowestCol: function(array, max) {
        if(max) {
          max = array.length - max + 1;
          array = array.slice(0).splice(0,max);
        }
        return $.inArray(Math.min.apply(window,array), array);
      },

      highestCol: function(array) {
        return $.inArray(Math.max.apply(window,array), array);
      },

      // --------------------
      // Other
      // --------------------
      
      destroy: function() {
        var ss = this;

        ss.container.children().each(function() {
          $(this).css({left: 0, top: 0})
        })

        ss.container.off("ss-arrange");
        ss.container.off("ss-destroy");
        $(window).off("resize.shapeshift");

        console.info("Shapeshift successfully destroyed")
      }

    };

    $.fn[pluginName] = function (options) {
      return this.each(function () {
        $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
      });
    };

})( jQuery, window, document );