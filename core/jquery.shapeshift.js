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
          return this;
        },

        publicFunction: function() {
          console.log("public function called");
        },

        _privateFunction: function() {
          console.log("Private function called");
        },

        destroy: function() {
          console.log('We destroyed it');
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

            if(instance instanceof Plugin && typeof instance[options] === "function") {
              returns = instance[options].apply(instance, Array.prototype.slice.call(arguments, 1));
            }

            if (options === "destroy") {
              return $.data(this, scoped_name, null);
            }
          });
        }
    };

})(jQuery, window, document);
