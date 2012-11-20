[Shapeshift](http://mcpants.github.com/jquery.shapeshift/)
==========

Inspired heavily by the jQuery Masonry plugin (http://masonry.desandro.com/), Shapeshift is a plugin which will dynamically arrange a collection of elements into a grid in their parent container. An example of this behavior is what you can find at sites like http://www.pinterest.com.

Shapeshift is intended to be a very bare bones version of these grid systems, however the drag and drop is what sets it apart from the other similar plugins.

[Check out a demo here.](http://mcpants.github.com/jquery.shapeshift/)

## Responsive Grid

Resizing the grid to accomodate for more or less space is automatically turned on in Shapeshift, so if your parent container has a 100% grid resizing the window will shapeshift the child objects around to accomodate for the new layout.

## Drag and Drop

Position any item within the grid by dragging and dropping them into place. Shapeshift will try to find a logical place for it and display that to you. Coming soon is the ability to drag and drop between multiple containers.

## Works on Touch Devices

To have the drag and drop functionality on touch devices you must include the "jquery.ui.touch-punch.min.js" file within the vendor folder. [jQuery touch punch](http://touchpunch.furf.com/) extends the jQuery UI Draggable library with touch support, so it must be included before Shapeshift and after the jQuery ui library.

## Credits

A big thanks to all of our [contributors](https://github.com/McPants/jquery.shapeshift/graphs/contributors)!

![we the media](http://wtmworldwide.com/wtm.png)

Shapeshift is maintained by [We The Media, inc.](http://wtmworldwide.com/)

## Getting Started

### Dependencies

Shapeshift requires the latest version of jQuery, and the drag and drop functionality requires jQuery UI Draggable/Droppable libraries. It also requires [jQuery Touch Punch](http://touchpunch.furf.com/) to work on touch devices.

### Setting Up the Parent Container

Objects that get shapeshifted will be absolutely positioned in their parent container. Therefore the parent container must be set to position: relative for the objects to position themselves correctly.

```html
<div class="container" style="position: relative;"></div>
```

### Setting up the Child Elements

The direct children of the parent element are what gets rearranged into the grid system. As mentioned before, each child element will be absolutely positions and obviously must then have a position: absolute attached to them.

**note**: All child elements **must** be the same width. Heights can be dynamic, however.

```html
<div class="container" style="position: relative;">
  <div style="position: absolute;">Child Element 1</div>
  <div style="position: absolute;">Child Element 2</div>
  <div style="position: absolute;">Child Element 3</div>
  <div style="position: absolute;">Child Element 4</div>
</div>
```

The class name and type of elements you can use are completely changable. The only real requirement is the parent must be relative and the children absolute. You can even call shapeshift on multiple elements that have the same class name.

### Shapeshift Everything!

Now that we have our setup complete, simply call .shapeshift() on the parent element. It will, by default, select all the children in the parent element to be rearranged.

```javascript
$('.container').shapeshift();
```

### Shapeshift Options

There are several options that can be passed into the plugin through the objects hash, which also includes turning core features on or off. Here is an example of those options and then descriptions of each attribute.

***All of these attributes are the defaults.***

```javascript
$('.container').shapeshift({
  animated: true,
  animatedOnDrag: true,
  autoContainerHeight: true,
  centerGrid: true,
  columns: null,
  draggable: true,
  objWidth: null,
  paddingY: 0,
  paddingX: 0,
  gutterX: 10,
  gutterY: 10,
  resizable: true,
  selector: ""
});
```

##### animated : boolean

Objects will animate into their positions using the jquery .animate() function. When changed to false, all objects will then use the .css() function and be placed into position instantly.

##### animatedOnDrag : boolean

Turn off the object animations of other elements when dragging one around.

##### autoContainerHeight : boolean

If this is set to true the parent container will have its height adjusted to match the tallest "column" within.

##### centerGrid : boolean

Center the grid inside the container. This is mainly helpful for when using a responsive container width.

##### columns : integer

Manually specify the number of columns to render. It will automatically detect by default.

##### draggable : boolean

Toggles the drag and drop functionality.

##### gutterX : integer

Sets the amount of padding horizontally between columns

##### gutterX : integer

Sets the amount of padding vertically between objects.

##### objWidth : integer

Manually set the width of the objects that will be rearranged. This number is used to determine the width of the columns, and depending on the width of the columns will determine how many columns will be able to fit in your container.

##### paddingY : integer

Offset the entire grid from the top of the container element with this attribute.

##### paddingX : integer

Offset the entire grid from the left side of the container element with this attribute.

##### resizable : integer

Toggles whether the container should be shapeshifted when the window is resized.

##### selector : string

Shapeshift will by default try to rearrange all of the child elements within the parent element. Setting a selector will target only the children with the class, ID, or element name that the selector describes.

### Styling the Dragged Element

When an element is picked up it the ".ss-moving" class will be appended to it. Just target it in your own CSS file. For example,

```css
.container .ss-moving {
  z-index: 9999;
  opacity: .7;
  transform: rotate(3deg);
}
```

### Detecting Changes

When an item is dropped it will trigger the event "shapeshifted" on the container element. You can then write some code to be fired off when that event occurs. The object that was just selected is also passed back to you. For example,

```javascript
$(".container").on("shapeshifted", function(e, $selected) {
  // Get the new position for the dropped item
  var position = $selected.index();

  // Get the index position of each object
  $objects = $(this).children();
  $objects.each(function(i) {
    position[i] = $(this).index();
  });
});
```

## For contributors

Feel like you've got an idea on how to optimize the code and want to share it? We are totally open to new changes, however this is one of the first publically available plugins that I am offering and therefore do not have an exact process on pull requests. Feel free to fork the project all you want, but be aware any pull requests that are made may take a while to get implemented (if at all).