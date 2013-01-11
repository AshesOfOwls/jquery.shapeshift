[Shapeshift](http://mcpants.github.com/jquery.shapeshift/)
==========

Inspired heavily by the jQuery Masonry plugin (http://masonry.desandro.com/), Shapeshift is a plugin which will dynamically arrange a collection of elements into a grid in their parent container. An example of this behavior is what you can find at sites like http://www.pinterest.com.

Shapeshift is intended to be a very bare bones version of these grid systems, however the drag and drop is what sets it apart from the other similar plugins.

[Check out a demo here.](http://mcpants.github.com/jquery.shapeshift/)

## Responsive Grid

Resizing the grid to accomodate for more or less space is automatically turned on in Shapeshift, so if your parent container has a 100% grid resizing the window will shapeshift the child objects around to accomodate for the new layout. You can even set CSS3 media queries on your objects and watch as they get shapeshifted around their new size!

## Drag and Drop

Position any item within the grid by dragging and dropping them into place. Shapeshift will try to find a logical place for it and display that to you. Coming soon is the ability to drag and drop between multiple containers.

## Works on Touch Devices

To have the drag and drop functionality on touch devices you must include the "jquery.ui.touch-punch.min.js" file within the vendor folder. [jQuery touch punch](http://touchpunch.furf.com/) extends the jQuery UI Draggable library with touch support, so it must be included before Shapeshift and after the jQuery ui library.

## Credits

A big thanks to all of our [contributors](https://github.com/McPants/jquery.shapeshift/graphs/contributors)!

![we the media](http://wtmworldwide.com/wtm.png)

Shapeshift is maintained by [We The Media, inc.](http://wtmworldwide.com/)

## Sites Using Shapeshift

Got a project that you are using shapeshift on? Let us know and we will happily throw a link to your page here!

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
  // Features
  centerGrid: true,
  enableAnimation: true,
  enableAnimationOnInit: false,
  enableAutoHeight: true,
  enableDrag: true,
  enableDragAnimation: true,
  enableRearrange: true,
  enableResize: true,
  enableTrash: false,

  // Options
  animateSpeed: 150,
  columns: null,
  dragClone: false,
  dragRate: 100,
  dragWhitelist: "*",
  dropCutoff: 0,
  dropWhitelist: "*",
  gutterX: 10,
  gutterY: 10,
  minHeight: 100,
  paddingY: 0,
  paddingX: 0,
  selector: ""
});
```

<table>
  <tr>
    <th>Feature</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
    <th>Example</th>
  </tr>
  <tr>
    <td>centerGrid</td>
    <td>Center the grid inside the container. This is mainly helpful for when using a responsive container width.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableAnimation</td>
    <td>Objects will animate into their new position when shapeshift() is initialized, or when the container is resized.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableAnimationOnInit</td>
    <td>Determines if objects will be animated into position when the page initially loads.</td>
    <td>Boolean</td>
    <td>false</td>
    <td>true</td>
  </tr>
  <tr>
    <td>enableAutoHeight</td>
    <td>If this is set to true the parent containers height will be automatically be adjusted to compensate for all of the child elements.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableDrag</td>
    <td>Enables objects in this container to be drag and dropped.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableDragAnimation</td>
    <td>Turn off the object animations of other elements when an element is being dragged.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableRearrange</td>
    <td>Setting this to false will disable any rearrangement via drag & drop in the current container.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableResize</td>
    <td>The elements will dynamically adjust to the width of their parent container.</td>
    <td>Boolean</td>
    <td>true</td>
    <td>false</td>
  </tr>
  <tr>
    <td>enableTrash</td>
    <td>Any element dropped on this container will be removed from the DOM.</td>
    <td>Boolean</td>
    <td>false</td>
    <td>true</td>
  </tr>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
    <th>Example</th>
  </tr>
  <tr>
    <td>animateSpeed</td>
    <td>The speed in milliseconds that the animations will transition using. This currently will also determine how often the drag function gets called, which is the animation speed divided by three (i.e. for the default speed, 100, the drag function will run every 33.3 milliseconds).</td>
    <td>Integer</td>
    <td>150</td>
    <td>276</td>
  </tr>
  <tr>
    <td>columns</td>
    <td>Manually specify the number of columns to render. It will automatically detect the maximum amount of columns by default.</td>
    <td>Integer</td>
    <td>null (Auto)</td>
    <td>5</td>
  </tr>
  <tr>
    <td>dragClone</td>
    <td>If set to true, the item that is dragged will be a clone and therefore will not remove the item from the original container upon drop. This would be analogous to "copy and paste", instead of the default "cut and paste".</td>
    <td>Boolean</td>
    <td>false</td>
    <td>true</td>
  </tr>
  <tr>
    <td>dragRate</td>
    <td>Determines how often the program will detect a position for the currently dragged item to be dropped, in milliseconds. The faster the speed then the more the computer will have to process, but the slower the speed the less responsive it is to items being dragged around.</td>
    <td>Integer</td>
    <td>100</td>
    <td>55</td>
  </tr>
  <tr>
    <td>dragWhitelist</td>
    <td>Specify a string which contains the elements that ***can*** be dropped into this container. This defaults to any element being draggable.</td>
    <td>String</td>
    <td>"*"</td>
    <td>".comment, .post, div, #taco"</td>
  </tr>
  <tr>
    <td>dropCutoff</td>
    <td>Prevents a user from dropping an item X amount from the end of the objects list. For example, if you have 20 items in your container, and you set the dropCutoff to be 3, then you would not be able to drop after the 17th item.</td>
    <td>Integer</td>
    <td>0</td>
    <td>3</td>
  </tr>
  <tr>
    <td>dropWhitelist</td>
    <td>Specify a string which contains the elements that ***can*** be dropped into this container. This defaults to any element being droppable.

    ***If a white list is set, only items listed with it can be draggable.***</td>
    <td>String</td>
    <td>"*"</td>
    <td>".comment, .post, div, #taco"</td>
  </tr>
  <tr>
    <td>gutterX</td>
    <td>Sets the amount of padding horizontally between columns.</td>
    <td>Integer</td>
    <td>10</td>
    <td>25</td>
  </tr>
  <tr>
    <td>gutterY</td>
    <td>Sets the amount of padding vertically between objects.</td>
    <td>Integer</td>
    <td>10</td>
    <td>25</td>
  </tr>
  <tr>
    <td>minHeight</td>
    <td>Set a minimum height that the container element will be. ***This is only helpful if you have enableAutoHeight turned on.***</td>
    <td>Integer</td>
    <td>100</td>
    <td>550</td>
  </tr>
  <tr>
    <td>paddingX</td>
    <td>Offset the entire grid from the left side of the container element with this attribute.</td>
    <td>Integer</td>
    <td>0</td>
    <td>42</td>
  </tr>
  <tr>
    <td>paddingY</td>
    <td>Offset the entire grid from the top of the container element with this attribute.</td>
    <td>Integer</td>
    <td>0</td>
    <td>42</td>
  </tr>
  <tr>
    <td>selector</td>
    <td>Shapeshift will by default try to rearrange all of the child elements within the parent element. Setting a selector will target only the children with the class, ID, or element name that the selector describes.
</td>
    <td>String</td>
    <td>""</td>
    <td>".gallery_image"</td>
  </tr>
</table>

### Styling the Dragged Element

When an element is picked up it the ".ss-moving" class will be appended to it. Just target it in your own CSS file. For example,

```css
.container .ss-moving {
  opacity: .7;
  transform: rotate(3deg);
}
```

### Detecting Changes

When an item has begun being dragged, it will trigger the "ss-event-dragged" on the container element. You can then write out some code to be fired off when that event occurs. The object that was just selected is also passed back to you. For example,

```javascript
$containers.on("ss-event-dragged", function(e, selected) {
  var $selected = $(selected);
  console.log("This is the item being dragged:", $selected);
});
```

Another event that you can watch for is the dropped event. This will also return the selected element, and is useful for getting the final index positions for all the elements in the container. For example,

```javascript
$containers.on("ss-event-dropped", function(e, selected) {
  var $selected = $(selected)
  console.log("The dropped item is:", $selected)

  // Get the index position of each object
  $objects = $(this).children();
  $objects.each(function(i) {
    console.log("Get the index position:", i)
    console.log("Get the current element:", $(this))
  });
});
```

Similarly, when an item is destroyed by being dropped in a container that has the enableTrash attribute turned on, that item will trigger the "ss-event-destroyed" event on the last container it was placed in.

```javascript
$containers.on("ss-event-destroyed", function(e, selected) {
  var $selected = $(selected);
  console.log("This is the item being destroyed:", $selected);
});
```

## For contributors

Feel like you've got an idea on how to optimize the code and want to share it? We are totally open to new changes, however this is one of the first publically available plugins that I am offering and therefore do not have an exact process on pull requests. Feel free to fork the project all you want, but be aware any pull requests that are made may take a while to get implemented (if at all).