;(function ($, window, document, undefined) {
    var pluginName = "shapeshift",
        defaults = {
          gutter: [20, 10]
        };

    function Plugin(element, options) {
        this.options = $.extend({}, defaults, options);
        this._name = pluginName;
        this._defaults = defaults;

        this.$element = $(element);
        this.element = element;

        this.init();
    }

    Plugin.prototype = {
        init: function() {
          this._setupGlobals();
          this._parseChildren();
          this._setupResizeListener();

          this._updateContainerWidth();

          return this;
        },

        /**
         * Creates the initial listener on the window for the resize event.
         *
         * @method _setupResizeListener
         */
        _setupResizeListener: function() {
          $(window).on("resize", function() {
            this.onResize();
          }.bind(this));
        },

        /**
         * Sets global variables to their proper initial states.
         *
         * @method _setupGlobals
         */
        _setupGlobals: function() {
          this._setIdentifier();

          this.children = [];
          this.colHeights = [];
          this.gutterX = this.options.gutter[0];
          this.gutterY = this.options.gutter[1];

          this._setColumnWidth();
        },

        /**
         * Cache the width of the container so that we do not have to keep
         * looking it up.
         *
         * @method _updateContainerWidth
         */
        _updateContainerWidth: function() {
          var container_width = this.$element.width();

          if(container_width != this.containerWidth) {
            this.containerWidth = this.$element.width();

            this._containerWidthChanged();
          }
        },

        /**
         * Whenever the container width has changed, we should run some logic
         * to see if more updates have to be made.
         *
         * @method _containerWidthChanged
         */
        _containerWidthChanged: function() {
          var column_count = this._getColumnCount();

          if(column_count != this.colCount) {
            this.colCount = column_count;
            this._columnCountChanged();
          }
        },

        /**
         * Whenever the amount of columns have changed, we need to run some
         * logic which occurs whenever columns have been added or lost.
         *
         * @method _columnCountChanged
         */
        _columnCountChanged: function() {
          this._resetColHeights();
          this.update();
        },

        /**
         * The column width can be set via the options object when instantiating
         * the plugin, or it can be dynamically set by finding the width of a
         * single span element on load.
         *
         * @method _setColumnWidth
         */
        _setColumnWidth: function() {
          $first_child = this.$element.children().first();
          this.colWidth = $first_child.width();
        },

        /**
         * Resets the children collection and adds all the currently existing
         * children to the collection.
         *
         * @method parseChildren
         * @access private
         */
        _parseChildren: function() {
          this.children = [];

          $children = this.$element.children();
          $children.each(function(n, el) {
            this._addNewChild(el, n);
          }.bind(this));
        },

        /**
         * Creates a unique identifier for this instantiation so that they
         * can be referenced individually.
         *
         * @method _setIdentifier
         */
        _setIdentifier: function() {
          this.identifier = "ss-" + Math.random().toString(36).substring(7);
        },

        /**
         * Code that needs to run whenever a resize event takes place.
         *
         * @method onResize
         */
        onResize: function() {
          this._updateContainerWidth();
        },

        /**
         * Adds a child that doesn't currently exist into the collection.
         *
         * @method addNewChild
         * @param el      {Element}   The DOM node for that child
         * @param index   {Integer}   The spot where the child will exist
         * @access private
         */
        _addNewChild: function(el, index) {
          var $el = $(el);

          this.children.push({
            el: el,
            $el: $el,
            index: index,
            height: $el.height(),
            x: 0,
            y: 0
          });
        },

        /**
         * Update gets run every time we need to have the elements shifted.
         *
         * @method update
         */
        update: function() {
          this._pack();
          this.render();
        },

        /**
         * The colHeights variable stores an array of the heights for every
         * existing column. This refreshes that array, which requires some
         * pre formatting of data.
         *
         * @method _resetColHeights
         */
        _resetColHeights: function() {
          var colHeights = [],
              columns = this._getColumnCount();

          for(var i=0;i<columns;i++) {
            colHeights[i] = 0;
          }

          this.colHeights = colHeights;
          this.colCount = colHeights.length;
        },

        /**
         * Calculates how many columns could fit into the current
         *
         * @method _getColumnCount
         */
        _getColumnCount: function() {
          return Math.floor(this.containerWidth / this.colWidth);
        },

        /**
         * The pack function is what helps calculate the positioning for all
         * of the child elements.
         *
         * @method _pack
         */
        _pack: function() {
          var children = this.children;

          for(var i=0;i<children.length;i++) {
            this._packChild(children[i]);
          }
        },

        /**
         * Calculates and assigns the position of a child object.
         *
         * @method _packChild
         */
        _packChild: function(child) {
          var column = this._fitMinIndex(this.colHeights),
              padding_offset = column * this.gutterX;

          child.y = this.colHeights[column];
          child.x = (column * child.$el.width()) + padding_offset;

          this.colHeights[column] += child.height + this.gutterY;
        },

        /**
         * When given an array, determines which array position is the lowest
         * value.
         *
         * @param array   {Array}   The array of values to compare against
         */
        _fitMinIndex: function(array) {
          return array.indexOf(Math.min.apply(null, array));
        },

        /**
         * Render is what physically moves the elements into their current
         * positions.
         *
         * @method render
         */
        render: function() {
          var children = this.children;

          for(var i=0;i<children.length;i++) {
            this._positionChild(children[i]);
          }
        },

        /**
         * Takes a child object and moves it to the correct position.
         *
         * @method _positionChild
         * @param child   {Object}   The child object
         */
        _positionChild: function(child) {
          var transform = "translate3d(" + child.x + "px," + child.y + "px,0)";

          child.$el.css({
            transform: transform
          });
        },

        /**
         * Destroy garbage cleans.
         *
         * @method destroy
         */
        destroy: function() {
          console.log('Clean up, clean up. Everybody, everywhere.');
        }
    };

    $.fn[pluginName] = function (options) {
        var scoped_name = "plugin_" + pluginName;

        // Shapeshift instantiation
        // $.shapeshift() or $.shapeshift({ option: thing })
        if(options === undefined || typeof options === "object") {
          return this.each(function() {
              if(!$.data(this, scoped_name)) {
                $.data(this, scoped_name, new Plugin(this, options));
              }
          });
        }

        var is_public_function = typeof options === "string" &&
                options[0] !== "_" &&
                options !== "init";

        if(!is_public_function) {
          return;
        }

        // Call public functions on already-created instances.
        this.each(function() {
          var instance = $.data(this, scoped_name);
          var is_function = instance instanceof Plugin &&
                  typeof instance[options] === "function";

          if(is_function) {
            instance[options].apply(instance,
                Array.prototype.slice.call(arguments, 1));
          }

          if(options === "destroy") {
            return $.data(this, scoped_name, null);
          }

          return this;
        });
    };

})(jQuery, window, document);
