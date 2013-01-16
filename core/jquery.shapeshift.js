;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName = "shapeshift",
        defaults = {
            // Features
            enableAnimation: true,
            enableAnimationOnInit: true,
            enableDrag: true,
            enableDragAnimation: true,
            enableMultiwidth: true,
            enableResize: true,
            enableRearrange: true,
            enableTrash: false,

            // Feature Options
            animateSpeed: 160,
            dragRate: 75,
            dragWhitelist: "*",
            dropWhitelist: "*",
            
            // Grid Properties
            centerGrid: true,
            columns: null,
            containerHeight: null,
            containerMinHeight: 100,
            gutterX: 10,
            gutterY: 10,
            paddingX: 10,
            paddingY: 10,
            selector: ""
        };

    // The actual plugin constructor
    function Plugin(element, options) {
      var ss = this;
      ss.initialized = false;

      ss.container = $(element);
      ss.options = $.extend({}, defaults, options);
      ss.init();
    }

    Plugin.prototype = {

      init: function() {
        // First time initalization of Shapeshift.
        // Create the events and render the grid.
        
        var ss = this;

        ss.render();
        ss.setEvents();

        ss.initialized = true;
      },

      setEvents: function() {
        // Creates events tied to the shapeshift containers.
        // This is important because triggered events are the way to
        // make sure the containers attributes apply to only to itself.
        
        var ss = this,
            options = ss.options,
            $container = ss.container;

        if(options.enableResize) { ss.resize(); }
        if(options.enableDrag) { ss.drag(); }

        $container.off("ss-event-arrange").on("ss-event-arrange", function() { 
                    if(options.enableRearrange) { ss.render(); } 
                  });

      },

      render: function() {
        // The generic rendering of everything
        
        var ss = this;

        ss.setGlobals();
        ss.arrange();
      },

      setGlobals: function() {
        // Create calculated variables that apply to multiple functions

        var ss = this,
            options = ss.options,
            $container = ss.container,
            gutterX = options.gutterX;

        // Determine the initial grid attributes
        var $children = ss.activeChildren = $container.children(options.selector);
        ss.container_width = $container.innerWidth();
        ss.inner_width = ss.container_width - (options.paddingX * 2);

        // Determine the width of each column
        var $first_child = ss.activeChildren.first();
        ss.child_width = $first_child.outerWidth();

        // If multiwidth is enabled, determine the column based
        // on the first childs colspan
        if(options.enableMultiwidth) {
          var child_span = $first_child.data("ss-colspan");
          if(child_span > 1) {
            ss.child_width = (ss.child_width - ((child_span - 1) * gutterX)) / child_span
          }
        }
        ss.col_width = ss.child_width + gutterX;

        // Determine how many columns there will be,
        // whilst never exceeding the amount of children
        var columns = options.columns;
        if(!columns) {
          columns = Math.floor(ss.inner_width / ss.col_width);

          if(columns > $children.length) {
            columns = $children.length;
          }
        }
        ss.columns = columns;
      },

      arrange: function() {
        // Moves items into place. Doesn't care about anything except getting
        // an array of positions and moving the objects to those places.

        var ss = this,
            options = ss.options,
            $children = ss.activeChildren,
            positions = ss.getChildPositions();

        // Determine if we should animate the elements
        if(!ss.initialized) {
          var animated = options.enableAnimationOnInit;
        } else {
          if($(".ss-moving")[0]) {
            var animated = options.enableDragAnimation;
          } else {
            var animated = options.enableAnimation;
          }
        }

        for(var i=0;i<positions.length;i++) {
          var $child = $($children[i]);

          if(!$child.hasClass("ss-moving")) {
            if(animated) {
              $child.stop(true, false).animate(positions[i], options.animateSpeed);
            } else {
              $child.css(positions[i]);
            }
          }
        }


        // Set the container height to match the tallest column
        // which is determined after getting child positions.
        var height = options.containerHeight
        if(!height) {
          height = ss.maxHeight;
          if(height < options.containerMinHeight) {
            height = options.containerMinHeight;
          }
        }
        ss.container.css("height", height);
      },

      getChildPositions: function() {
        // Iterates over each child element and determines
        // what column it will fit into.

        var ss = this,
            options = ss.options;


        // Create an array element for each column, which is then
        // used to store each columns current height.
        var colHeights = [],
            columns = ss.columns;

        for(var i=0;i<columns;i++) {colHeights.push(options.paddingY);}


        // Get properties for the grid
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
        // and the attributes that apply to it.
        for(var i=0;i<$children.length;i++) {
          var $child = $($children[i]),
              col = $.inArray(Math.min.apply(window,colHeights), colHeights),
              height = $child.outerHeight(true) + options.gutterY,
              offsetX = (col_width * col) + grid_offset,
              offsetY = colHeights[col];

          // Store the position to animate into place later
          positions[i] = { left: offsetX, top: offsetY };

          colHeights[col] += height;
        }

        // Store the max height
        ss.maxHeight = Math.max.apply(Math,colHeights) + options.paddingY;

        return positions;
      },

      drag: function() {
        // Create the jQuery drag and drop functionality.

        var ss = this,
            options = ss.options,
            $children = ss.activeChildren;

        // Globals
        var dragging = false,
            $selected, selectedOffsetX, selectedOffsetY;
        $currentContainer = ss.container;


        // Dragging
        $children.filter(options.dragWhitelist).draggable({
          addClasses: false,
          containment: 'document',
          zIndex: 9999,
          start: function(e, ui) { start(e, ui); },
          drag: function(e, ui) { drag(e, ui); },
          stop: function(e, ui) { stop(e); }
        });

        function start(e, ui) {
          // Set the selected item.
          $selected = $(e.target).addClass("ss-moving");
          $currentContainer = $selected.parent();

          // For determining the mouse drag offset
          selectedOffsetY = $selected.outerHeight() / 2;
          selectedOffsetX = $selected.outerWidth() / 2;
        }

        function drag(e, ui) {
          if(!dragging) {
            $objects = $currentContainer.children();

            // Determine the position to insert the selected item into
            position = ss.getIntendedPosition(e);
            $target = $objects.get(position - 1);

            // Insert the selected item
            $selected.insertAfter($target);

            $currentContainer.trigger("ss-event-arrange");
            $(".ss-prev-container").trigger("ss-event-arrange");

            // Drag can only be called every X milliseconds
            dragging = true;
            window.setTimeout(function() {
              dragging = false;
            }, options.dragRate)
          }

          // Manually override the elements position
          ui.position.left = e.pageX - $selected.parent().offset().left - selectedOffsetX;
          ui.position.top = e.pageY - $selected.parent().offset().top - selectedOffsetY;
        }

        function stop(e) {
          // Remove the selected item
          $selected = $(e.target).removeClass("ss-moving");
        }


        // Dropping
        ss.container.droppable({
          accept: options.dropWhitelist,
          tolerance: 'intersect',
          drop: function(e) { drop(e); },
          over: function(e) { over(e); }
        });

        function over(e) {
          // Determine the current container we are hovering on
          // top of and set the previous container.
          $currentContainer.addClass("ss-prev-container");
          $currentContainer = $(e.target).removeClass("ss-prev-container");
          dragging = false;
        }

        function drop(e) {
          if(options.enableTrash) {
            // Remove the selected element
            $selected = $(".ss-moving").remove();
            $currentContainer.trigger("ss-event-arrange").trigger("ss-event-destroyed", $selected)
          } else {
            // Arrange the current container back to normal,
            // and reset the temporary class names
            $selected = $(".ss-moving").removeClass("ss-moving");
            $selectedContainer = $selected.parent();
            $selectedContainer.trigger("ss-event-arrange").trigger("ss-event-dropped", $selected);
          }
          $(".ss-prev-container").removeClass("ss-prev-container")
        }

      },

      getIntendedPosition: function(e) {
        return 1;
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