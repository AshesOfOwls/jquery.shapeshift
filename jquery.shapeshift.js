;(function ( $, window, undefined ) {
  // Defaults
  var pluginName = 'shapeshift',
      document = window.document,
      defaults = {
        adjustContainerHeight: true,
        draggable: true,
        objWidth: 300,
        gutterX: 10,
        gutterY: 10,
        rearrange: true,
        selector: "div"
      };

  function Plugin( element, options ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  Plugin.prototype.init = function () {
    this.shiftit();
    if(this.options.draggable) { this.draggable(); }
  };

  Plugin.prototype.shiftit = function (not_object) {
    var options = this.options;

    // Get our jQuery objects
    var $container = $(this.element),
        $objects = $container.children(options.selector).not(not_object);

    // Set up initial variables
    var columns = 0,
        colHeights = [],
        colWidth = options.objWidth + options.gutterX,
        objPositions = [];

    // Determine how many columns are currently active
    columns = Math.floor($container.innerWidth() / colWidth);

    // Create an array element for each column, which is then
    // used to store that columns current height.
    for(var i=0;i<columns;i++) {colHeights.push(0);}

    // Loop over each element and determine what column it fits into
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $obj = $($objects[obj_i]);

      // Determine the position of this object
      var col = shortestCol(colHeights),
          offsetX = colWidth * col,
          offsetY = colHeights[col];

      attributes = {
        left: offsetX,
        top: offsetY
      };

      // Increase the calculated total height of the current column
      colHeights[col] += $obj.outerHeight(true) + options.gutterY;

      // Store the position to animate into place later
      objPositions[obj_i] = attributes;
    }

    // Animate / Move each object into place
    for(var obj_i=0; obj_i < $objects.length; obj_i++) {
      var $object = $($objects[obj_i]),
          attributes = objPositions[obj_i];

      if(options.rearrange) {
        $object.animate(attributes, { queue: false });
      } else {
        $object.css(attributes);
      }
    }

    if (options.adjustContainerHeight) {
      // Set the container height to match the tallest column
      var col = tallestCol(colHeights),
          height = colHeights[col];

      $container.css("height", height);
    }

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
  }

  Plugin.prototype.draggable = function () {
    var options = this.options,
        self = this;

    // Get our jQuery objects
    var $container = $(this.element),
        $objects = $container.children(options.selector);

    // Set some initial global variables
    var $selected = false,
        $hovered = false,
        selectedX = null,
        selectedY = null,
        selectedHeight = null,
        hoveredX = null,
        hoveredY = null,
        originalPositions = [],
        offsetY = null;

    $objects.draggable({
      start: function(e) { dragStart($(this), e); }
    });
    $objects.droppable({
      over: function() { dragEnter($(this)); }
    })
    $container.droppable({
      drop: function() { dropObject(); }
    })

    function dragStart($object, e) {
      // Set the initial attributes for the selected item
      $selected = $object;
      selectedX = hoveredX = $selected.position().left;
      selectedY = hoveredY = $selected.position().top;
      selectedHeight = $selected.innerHeight() + options.gutterY;

      // Add a class to the dragged element
      $selected.addClass("moving")

      setOriginalPositions();
    }

    function setOriginalPositions() {
      // Get an array of the current position attributes of each element,
      // which we can then use to relatively position everything.
      originalPositions = [];
      if(!$hovered) {
        $objects.each(function(i) {
          $object = $(this);
          attributes = {
            left: $object.position().left,
            top: $object.position().top
          }
          originalPositions[i] = attributes;
        });
      }
    }

    function dragEnter($newHovered) {
      // When an object is being dragged over another object, that object
      // will open up a gap for the dragged object to be placed into.
      var newHoveredX = $newHovered.position().left,
          newHoveredY = $newHovered.position().top,
          isNotSelected = !((newHoveredX === selectedX) && (newHoveredY === selectedY)),
          isNotBelow = !((newHoveredX === selectedX) && (newHoveredY - selectedHeight === selectedY));

      if(isNotSelected && isNotBelow) {
        // Only set the item as being hovered on if it is not the currently
        // selected item, and it is also not the item directly below
        // the selected item because this would open no new gap.
        $hovered = $newHovered;
        hoveredX = newHoveredX;
        hoveredY = newHoveredY;

        // Move each item to its original position
        // unless it is it the currently hovered object or below
        $objects.each(function(i) {
          var $object = $(this),
              isAfterHovered = $object.position().top >= hoveredY,
              isInSameColumn = $object.position().left === hoveredX,
              newPosition = originalPositions[i];

          if(isAfterHovered && isInSameColumn) {
            attributes = {
              left: newPosition.left,
              top: newPosition.top + selectedHeight
            }
          } else {
            attributes = originalPositions[i]
          }

          if($object.is(':not(".moving")')) {
            $object.stop(true, true).animate(attributes, 200);
          }
        })
      }
    }

    function dropObject() {
      // Remove the dragging style
      $selected.removeClass("moving");

      if($hovered) {
        // Move the selected item into the currently hovered items
        // original position
        selectedAttributes = originalPositions[$hovered.index()]
        $selected.stop(true, true).css(selectedAttributes);

        var movedIntoDifferentColumn = false;
        if(selectedX != hoveredX) { movedIntoDifferentColumn = true; }

        // Move the items in the old column back into place
        $objects.stop(true, true);
        $objects.each(function(i) {
          var $object = $(this),
              objectX = $object.position().left;

          if(objectX === selectedX) {
            // The object was in the selected items original row
            // and therefore requires adjustment
            var objectY = $object.position().top;

            if(movedIntoDifferentColumn) {
              // We just need to move everything lower than the selected
              // items original spot up the selected items height.
              if(objectY > selectedY) {
                objectY -= selectedHeight;
              }
            } else {
              // If we are moving into the same column...
              if(selectedY > hoveredY) {
                // If we are moving the selected item higher, then just shift
                // everything up the selected items height
                if(objectY > selectedY + selectedHeight) {
                  objectY -= selectedHeight;
                }
              } else {
                // We are moving the element lower, therefore we need to shift
                // everything up past the original position
                if(objectY > selectedY) {
                  objectY -= selectedHeight;
                }
              }
            }

            attributes = {
              left: objectX,
              top: objectY
            }

            $object.stop(true, true).animate(attributes, 200);
          }
        })

        $hovered = false;
      } else {
        selectedAttributes = originalPositions[$selected.index()]
        $selected.stop(true, true).css(selectedAttributes);
      }
    }
  }

  // Prevent against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
    });
  }

}(jQuery, window));