;(function ($, window, document, undefined) {
    var pluginName = "shapeshift",
        defaults = {
          are: "useful"
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
          this.parseChildren();

          return this;
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
            this.addNewChild(el, n);
          }.bind(this));
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
          this.children.push({
            el: el,
            index: index,
            x: 0,
            y: 0
          });
        },

        destroy: function() {
          console.log('Clean up, clean up. Everybody, everywhere.');
        }
    };

    $.fn[pluginName] = function ( options ) {
        var scoped_name = "plugin_" + pluginName;

        // Shapeshift instantiation
        // $.shapeshift() or $.shapeshift({ option: thing })
        if(options === undefined || typeof options === "object") {
          return this.each(function() {
              if(!$.data(this, scoped_name)) {
                $.data(this, scoped_name, new Plugin(this, options));
              }
          });
        } else {
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

            if (options === "destroy") {
              return $.data(this, scoped_name, null);
            }

            return this;
          });
        }
    };

})(jQuery, window, document);
