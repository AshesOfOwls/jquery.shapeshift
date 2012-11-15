Shapeshift
==========

Inspired heavily by the jQuery Masonry plugin (http://masonry.desandro.com/), Shapeshift is a plugin which will dynamically arrange a collection of elements into a grid in their parent container. An example of this behaviour is what you can find at sites like http://www.pinterest.com.

Shapeshift is intended to be a very bare bones version of these grid systems, however one specific feature makes it stand out from the rest...

## Drag and Drop

A unique functionality to Shapeshift is the ability to drag and drop items within the dynamic grid.

Check out an example here: INSERT EXAMPLE LINK.

## Responsive Grid

Resizing the grid to accomodate for more or less space is automatically turned on in Shapeshift, so if your parent container has a 100% grid resizing the window will shapeshift the child objects around to accomodate for the new layout.

## Getting Started

### Dependencies

Shapeshift requires the latest version of jQuery, and the drag and drop functionality requires jQuery UI Draggable/Droppable libraries, of which is included.

### Setting Up the Parent Container

Objects that get shapeshifted will be absolutely positioned in their parent container. Therefore the parent container must be set to position: relative for the objects to position themselves correctly.

```html
<div id="container" style="position: relative;"></div>
```

### Setting up the Child Elements

The direct children of the parent element are what gets rearranged into the grid system. As mentioned before, each child element will be absolutely positions and obviously must then have a position: absolute attached to them.

```html
<div id="container" style="position: relative;">
  <div class="child" style="position: absolute;">Child Element 1</div>
  <div class="child" style="position: absolute;">Child Element 2</div>
  <div class="child" style="position: absolute;">Child Element 3</div>
  <div class="child" style="position: absolute;">Child Element 4</div>
</div>
```

### Shapeshift Everything!

Now that we have our setup complete, simply call .shapeshift() on the parent element. It will, by default, select all the children in the parent element to be rearranged.

```javascript
$('#container').shapeshift();
```

### Turning off Features

All features that shapeshift offers are turned on by default. It's easy to turn them off by just passing values to the options hash.

```javascript
$('#container').shapeshift({
  animated: false,
  draggable: false,
  resizable: false
});
```

##### Animated

Turning off the Animated feature will position the elements by using .css instead of .animate.

##### Draggable

Toggles the drag and drop functionality.

##### Resizable

Toggles whether the container should be shapeshifted when the window is resized.