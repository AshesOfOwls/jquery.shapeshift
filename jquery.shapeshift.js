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

    // Set our html elements to be draggable
    $objects.attr("draggable", true);
    $objects.css("cursor", "move");

    // Our dragging functions
    $container.off().on("dragover drop", function(e) {
      // Required preventDefault for drop effect
      if(e.type === "dragover") { e.preventDefault(); }
      if(e.type === "drop") { dropObject(); }
    });

    $objects.off().on("dragstart dragenter dragover", function(e) {
      if(e.type === "dragstart") { startDragging($(this)); }
      if(e.type === "dragenter") { dragOver($(this)); }
    });

    function startDragging($object) {
      $selected = $object;
      // Set the initial attributes for the selected item
      selectedX = hoveredX = $selected.position().left;
      selectedY = hoveredY = $selected.position().top;
      selectedHeight = $selected.innerHeight() + options.gutterY;

      $selected.css('opacity', '0.75');

      setOriginalPositions();
    }

    function setOriginalPositions() {
      originalPositions = [];
      if(!$hovered) {
        // Set an array of the original positions
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

    function dragOver($newHovered) {
      var newHoveredX = $newHovered.position().left,
          newHoveredY = $newHovered.position().top,
          isSelected = ((newHoveredX === selectedX) && (newHoveredY === selectedY)),
          isBelow = ((newHoveredX === selectedX) && (newHoveredY - selectedHeight === selectedY));

      if(!isSelected && !isBelow) {
        $hovered = $newHovered;
        hoveredX = newHoveredX;
        hoveredY = newHoveredY;

        newPositions = originalPositions.slice(0)

        // Move each item to its original position
        // unless it is it the currently hovered object or below
        $objects.each(function(i) {
          $object = $(this);

          isAfterHovered = $object.position().top >= hoveredY
          isInSameColumn = $object.position().left === hoveredX

          newPosition = originalPositions[i];

          if(isAfterHovered && isInSameColumn) {
            attributes = {
              left: newPosition.left,
              top: newPosition.top + selectedHeight
            }
          } else {
            attributes = originalPositions[i]
          }

          $object.stop(true, true).animate(attributes, 325);
        })
      }
    }

    function dropObject() {
      $selected.css('opacity', '1');

      selectedAttributes = originalPositions[$hovered.index()]
      if(selectedAttributes.left === selectedX) {
        if(selectedAttributes.top > selectedY) {
          selectedAttributes.top -= selectedHeight;
        }
      }
      $selected.stop(true, true).animate(selectedAttributes);

      // Move the items in the old column back into place
      $objects.each(function() {
        $object = $(this);
        objectX = $object.position().left;
        objectY = $object.position().top;

        if(objectX === selectedX) {
          if(objectY > selectedY) {
            objectY -= selectedHeight;

            attributes = {
              left: objectX,
              top: objectY
            }
            $object.stop(true, true).animate(attributes)
          }
        }
      })

      $hovered = false;
    }
  }

  // Prevent against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
    });
  }

}(jQuery, window));