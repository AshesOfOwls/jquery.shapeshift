[Shapeshift](http://mcpants.github.com/jquery.shapeshift/)
==========

Inspired heavily by the jQuery Masonry plugin (http://masonry.desandro.com/), Shapeshift is a plugin which will dynamically arrange a collection of elements into a grid in their parent container. An example of this behaviour is what you can find at sites like http://www.pinterest.com.

Shapeshift is intended to be a very bare bones version of these grid systems, however the drag and drop is what sets it apart from the other similar plugins.

[Check out a demo here.](http://mcpants.github.com/jquery.shapeshift/)

## Drag and Drop

A unique functionality to Shapeshift is the ability to drag and drop items within the dynamic grid.

Check out an example here: INSERT EXAMPLE LINK.

## Responsive Grid

Resizing the grid to accomodate for more or less space is automatically turned on in Shapeshift, so if your parent container has a 100% grid resizing the window will shapeshift the child objects around to accomodate for the new layout.

## Getting Started

### Dependencies

Shapeshift requires the latest version of jQuery, and the drag and drop functionality requires jQuery UI Draggable/Droppable libraries.

### Setting Up the Parent Container

Objects that get shapeshifted will be absolutely positioned in their parent container. Therefore the parent container must be set to position: relative for the objects to position themselves correctly.

```html
<div id="container" style="position: relative;"></div>
```

### Setting up the Child Elements

The direct children of the parent element are what gets rearranged into the grid system. As mentioned before, each child element will be absolutely positions and obviously must then have a position: absolute attached to them.

NOTE: All child elements MUST be the same width. Heights can be dynamic, however.

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

### Shapeshift Options

There are several options that can be passed into the plugin through the objects hash, which also includes turning core features on or off. Here is an example of those options and then descriptions of each attribute.

All of these attributes are the defaults.

```javascript
$('#container').shapeshift({
  adjustContainerHeight: true,
  animated: true,
  animatedOnDrag: true,
  draggable: true,
  objWidth: null,
  gutterX: 10,
  gutterY: 10,
  resizable: true,
  selector: ""
});
```
##### adjustContainerHeight : boolean

This will set the parent container height to match the tallest "column" of objects. This is to solve clearfix issues and under most circumstances should be left on.

##### animated : boolean

Objects will animate into their positions using the jquery .animate() function. When changed to false, all objects will then use the .css() function and be placed into position instantly.

##### animatedOnDrag : boolean

Turn off the object animations of other elements when dragging one around.

##### draggable : boolean

Toggles the drag and drop functionality.

##### objWidth : integer

Manually set the width of the objects that will be rearranged. This number is used to determine the width of the columns, and depending on the width of the columns will determine how many columns will be able to fit in your container.

##### gutterX : integer

Sets the amount of padding horizontally between columns

##### gutterX : integer

Sets the amount of padding vertically between objects.

##### resizable : integer

Toggles whether the container should be shapeshifted when the window is resized.

##### selector : string

Shapeshift will by default try to rearrange all of the child elements within the parent element. Setting a selector will target only the children with the class, ID, or element name that the selector describes.

### Styling the Dragged Element

When an element is picked up it the ".ss-moving" class will be appended to it. Just target it in your own CSS file. For example,

```css
#container .ss-moving {
  z-index: 9999;
  opacity: .7;
  transform: rotate(3deg);
}
```

### Detecting Changes

When an item is dropped it will trigger the event "shapeshifted" on the container element. You can then write some code to be fired off when that event occurs. For example,

```javascript
$("#container").on("shapeshifted", function() {
  // Get the index position of each object
  $objects = $(this).children();
  $objects.each(function() {
    index = $(this).index();
    // You can then save the index as the
    // position of the element in your database
  })
})
```

## For contributors

Feel like you've got an idea on how to optimize the code and want to share it? We are totally open to new changes, however this is one of the first publically available plugins that I am offering and therefore do not have an exact process on pull requests. Feel free to fork the project all you want, but be aware any pull requests that are made may take a while to get implemented (if at all).