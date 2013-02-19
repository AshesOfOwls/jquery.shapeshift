;(function ($, window, document, undefined) {

    var pluginName = "shapeshift",
        defaults = {
          // Grid Properties
          centerGrid: true,
          gutterX: 10,
          gutterY: 10,
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
      ss.grid_height = 100;
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
            $container = ss.container,
            $children = $container.children(":visible"),
            positions = ss.getPositions(),
            animate = ss.animate,
            animateSpeed = ss.options.animateSpeed;

        for(var i=0;i<positions.length;i++) {
          var $child = $children.eq(i);

          if(animate) {
            $child.stop(true, false).animate(positions[i], animateSpeed);
          } else {
            $child.css(positions[i]);
          }
        }

        $container.height(ss.grid_height)
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

        // Get DOM properties
        var $container = ss.container,
            $children = $container.children(":visible"),
            container_width = $container.innerWidth() - (paddingX * 2),
            child_width = $children.first().outerWidth(),
            col_width = child_width + gutterX,
            columns = Math.floor((container_width + gutterX) / col_width);

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
              col = ss.lowestCol(col_heights),
              offsetX = (col * col_width) + paddingX + offset,
              offsetY = col_heights[col];

          col_heights[col] += $child.height() + gutterY;

          positions.push({left: offsetX, top: offsetY});
        }

        // Store the grid height
        var grid_height = col_heights[ss.highestCol(col_heights)]
        ss.grid_height = grid_height - gutterY + paddingY;

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
          console.log("resize")
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

      lowestCol: function(array) {
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
        if (!$.data(this, "plugin_" + pluginName)) {
          $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
        }
      });
    };

})( jQuery, window, document );