Shapeshift v2.0
===============

[Check out a demo here.](http://mcpants.github.com/jquery.shapeshift/)

Column Grid System + Drag and Drop
----------------------------------

Inspired heavily by the [jQuery Masonry plugin](http://masonry.desandro.com/), Shapeshift is a plugin which will dynamically arrange a collection of elements into a column grid system similar to [Pinterest](http://www.pinterest.com). What sets it apart is the ability to drag and drop items within the grid while still maintaining a logical index position for each item. This allows for the grid to be rendered exactly the same every time Shapeshift is used, as long as the child elements are in the correct order.


Index
-----
[Getting Started](#getting-started)
* [Dependencies](#dependencies)
* [Setting up the Parent Container](#setting-up-the-parent-container)
* [Setting up the Child Elements](#setting-up-the-child-elements)


Features
--------

* **Drag and Drop**
  Rearrange items within a container or even drag items between multiple Shapeshift enabled containers. Dragging elements around will physically change their index position within their parent container. When a page reloads, as long as the child elements are placed in the correct order then the grid will look exactly the same.

* **Works on Touch Devices**
  Shapeshift uses jQuery UI Draggable/Droppable for help with the drag and drop system. Luckily there is already a plugin called [jQuery Touch Punch](http://touchpunch.furf.com/) which provides touch support for jQuery UI D/D. It can be found in the vendor folder.

* **Multiwidth Elements**
  A new feature in 2.0 is the ability to add elements that can span across multiple columns as long as their width is correctly set through CSS.

* **Responsive Grid**
  Enabled by default, Shapeshift will listen for window resize events and arrange the elements within it according to the space provided by their parent container.


Credits
-------

A big thanks to all of our [contributors](https://github.com/McPants/jquery.shapeshift/graphs/contributors)!

![we the media](http://wtmworldwide.com/wtm.png)

Shapeshift is maintained by [We The Media, inc.](http://wtmworldwide.com/)


Sites Using Shapeshift
----------------------

Got a project that you are using shapeshift on? Let us know and we will happily throw a link to your page here!


Getting Started
---------------

### Dependencies

Shapeshift requires the latest version of jQuery, and drag and drop feature (enabled by default) requires jQuery UI Draggable/Droppable libraries. It also requires [jQuery Touch Punch](http://touchpunch.furf.com/) to work on touch devices.

### Setting Up the Parent Container

Shapeshift arranges child elements by absolutely positioning them in their parent container which must be set to "position: relative". The container does not have to be a div and can be substituted for any element that can have child elements, such as an unordered list.

```html
<div class="container" style="position: relative;"></div>
```

### Setting up the Child Elements

By default all child elements within the parent container will be Shapeshifted. Just make sure that they are set to "position: absolute" in your CSS file.

```html
<div class="container" style="position: relative;">
  <div style="position: absolute;">Child Element 1</div>
  <div style="position: absolute;">Child Element 2</div>
  <div style="position: absolute;">Child Element 3</div>
  <div style="position: absolute;">Child Element 4</div>
  ...
</div>
```

### Multiwidth Children

Shapeshift relies on a column grid system, this means that every time Shapeshift is initialized on a container it will determine the column width based on the width of the first child in that container. If no column width is set on a child element then Shapeshift will assume it will use it to set the single column width for the grid.

To make a child element multiwidth, simply add the data attribute "data-ss-colspan=X", where X is the amount of columns it should span. Shapeshift does not automatically set their width though so the childs width must already be set to the correct width. The calculated width must be set to: "single column width * columns to span + the gutter space in between".

For example, assuming the default gutter value of 10px, multiwidth elements can be created as such:

```css
.container div { width: 80px; } // When no colspan is set, it is one colspan
.container div[data-ss-colspan="2"] { width: 170px; }
.container div[data-ss-colspan="3"] { width: 260px; }
.container div[data-ss-colspan="4"] { width: 350px; }
```

```html
<div class="container" style="position: relative;">
  <div style="position: absolute;">1 Column Width</div>
  <div style="position: absolute;" data-ss-colspan="2">2 Column Width</div>
  <div style="position: absolute;" data-ss-colspan="3">3 Column Width</div>
  <div style="position: absolute;" data-ss-colspan="4">4 Column Width</div>
  ...
</div>
```


### Shapeshift Everything!

Now that we have our setup complete, simply call .shapeshift() on the parent element. It will, by default, select all the children in the parent element to be rearranged.

```javascript
$('.container').shapeshift();
```


Options
---------------

### Shapeshift Options

Customize your grid even further. All of these are the default options and more in depth information can be found further down the page.

```javascript
$('.container').shapeshift({
  // The Basics
  selector: "*",

  // Features
  enableDrag: true,
  enableCrossDrop: true,
  enableResize: true,

  // Grid Properties
  align: "center",
  columns: null,
  minColumns: 1,
  autoHeight: true,
  height: 100,
  maxHeight: null,
  minHeight: 100,
  gutterX: 10,
  gutterY: 10,
  paddingX: 10,
  paddingY: 10,

  // Animation
  animated: true,
  animateOnInit: false,
  animationSpeed: 225,
  animationThreshold: 100,

  // Drag/Drop Options
  dragClone: false,
  deleteClone: true,
  dragRate: 100,
  dragWhitelist: "*",
  crossDropWhitelist: "*",
  cutoffStart: null,
  cutoffEnd: null,

  // Customize CSS
  cloneClass: "ss-cloned-child",
  activeClass: "ss-active-child",
  draggedClass: "ss-dragged-child",
  placeholderClass: "ss-placeholder-child",
  originalContainerClass: "ss-original-container",
  currentContainerClass: "ss-current-container",
  previousContainerClass: "ss-previous-container"
});
```

### The Basics

<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Type</th>
    <th>Acceptable Values</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>Selector</td>
    <td>Use a CSS selector to specify which child elements should be Shapeshifted.</td>
    <td>String</td>
    <td>Any CSS selector, such as ".amelia" or "#pond"</td>
    <td>"*"</td>
  </tr>
</table>

### Extra Features
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>enableDrag</td>
    <td>Allows for the child items to be dragged in the container and to other containers that have drop enabled. See Drag and Drop options for more customization.</td>
    <td>true</td>
  </tr>
  <tr>
    <td>enableCrossDrop</td>
    <td>Allows for children to be dropped from *other* containers into this one.</td>
    <td>true</td>
  </tr>
  <tr>
    <td>enableResize</td>
    <td>Shapeshift will listen for the window resize event and rearrange the child elements if the parent container has also changed.</td>
    <td>true</td>
  </tr>
</table>

### Grid Properties
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Acceptable Values</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>align</td>
    <td>Align / justify the grid.</td>
    <td>"left", "center", "right"</td>
    <td>"center"</td>
  </tr>
  <tr>
    <td>columns</td>
    <td>Force the grid to have a specific number of columns. Setting this to null will automatically determine the maximum columns for the width of the container.</td>
    <td>Any Integer >= 1</td>
    <td>null</td>
  </tr>
  <tr>
    <td>minColumns</td>
    <td>This will prevent the grid from ever going below a set number of columns. If using multiwidth then this must be set to the highest colspan child element.</td>
    <td>Any Integer >= 1</td>
    <td>1</td>
  </tr>
  <tr>
    <td>autoHeight</td>
    <td>Automatically sets the height of the container according to the height of the contents within it. If set to false, then the "height" option must also be specified.</td>
    <td>true, false</td>
    <td>true</td>
  </tr>
  <tr>
    <td>maxHeight</td>
    <td>If "autoHeight" is turned on, maxHeight will never allow the container height to go above this number.</td>
    <td>Any Integer >= 1</td>
    <td>null</td>
  </tr>
  <tr>
    <td>minHeight</td>
    <td>If "autoHeight" is turned on, minHeight will never allow the container height to go below this number.</td>
    <td>Any Integer >= 1</td>
    <td>100</td>
  </tr>
  <tr>
    <td>gutterX</td>
    <td>The number of pixels horizontally between each column.</td>
    <td>Any Integer >= 0</td>
    <td>10</td>
  </tr>
  <tr>
    <td>gutterY</td>
    <td>The number of pixels vertically between each element.</td>
    <td>Any Integer >= 0</td>
    <td>10</td>
  </tr>
  <tr>
    <td>paddingX</td>
    <td>Sets the horizontal padding of the grid between the left and right sides of the container.</td>
    <td>Any Integer >= 0</td>
    <td>10</td>
  </tr>
  <tr>
    <td>paddingY</td>
    <td>Sets the vertical padding of the grid between the top and bottom sides of the container.</td>
    <td>Any Integer >= 0</td>
    <td>10</td>
  </tr>
</table>

### Animation Settings
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Acceptable Values</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>animated</td>
    <td>When children shift around via the resize or drag and drop features, they will animate into place.</td>
    <td>true, false</td>
    <td>true</td>
  </tr>
  <tr>
    <td>animateOnInit</td>
    <td>Animates the children into position upon page load.</td>
    <td>true, false</td>
    <td>false</td>
  </tr>
  <tr>
    <td>animationSpeed</td>
    <td>The speed at which the children will animate into place.</td>
    <td>Any Integer >= 0</td>
    <td>225</td>
  </tr>
  <tr>
    <td>animationThreshold</td>
    <td>If there are too many elements on a page then it can get very laggy during animation. If the number of children exceed this threshold then they will not animate when changing positions.</td>
    <td>Any Integer >= 0</td>
    <td>100</td>
  </tr>
</table>

### Drag and Drop Settings
<table>
  <tr>
    <th>Option</th>
    <th>Description</th>
    <th>Acceptable Values</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>dragClone</td>
    <td>When an element is dragged it will create a clone instead.</td>
    <td>true, false</td>
    <td>false</td>
  </tr>
  <tr>
    <td>deleteClone</td>
    <td>If a cloned item is dropped into its original container, delete the clone that was made.</td>
    <td>true, false</td>
    <td>true</td>
  </tr>
  <tr>
    <td>dragRate</td>
    <td>The number of milliseconds that Shapeshift will attempt to find a target pisition for a dragged item.</td>
    <td>Any Integer >= 0</td>
    <td>100</td>
  </tr>
  <tr>
    <td>dragRate</td>
    <td>The number of milliseconds that Shapeshift will attempt to find a target pisition for a dragged item.</td>
    <td>Any Integer >= 0</td>
    <td>100</td>
  </tr>
  <tr>
    <td>dragWhitelist</td>
    <td>A CSS selector specifying the elements which can be dragged.</td>
    <td>Any CSS selector, such as ".river" or "#song"</td>
    <td>"*"</td>
  </tr>
  <tr>
    <td>crossDropWhitelist</td>
    <td>A CSS selector specifying the elements which can be dropped into this container from *other* containers.</td>
    <td>Any CSS selector, such as ".martha" or "#jones"</td>
    <td>"*"</td>
  </tr>
  <tr>
    <td>cutoffStart</td>
    <td>Items cannot be dragged to an index position below this number.</td>
    <td>Any Integer >= 0</td>
    <td>null</td>
  </tr>
  <tr>
    <td>cutoffEnd</td>
    <td>Items cannot be dragged to an index position past this number.</td>
    <td>Any Integer >= 0</td>
    <td>null</td>
  </tr>
</table>

### Customize CSS
Certain elements will have CSS classes attached to them for specific events. Customize those CSS classes if needed.
<table>
  <tr>
    <th>Option</th>
    <th>Affected Element</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>activeClass</td>
    <td>Child Elements</td>
    <td>Every active Shapeshift child item will have this class applied to them.</td>
    <td>ss-active-child</td>
  </tr>
  <tr>
    <td>cloneClass</td>
    <td>Cloned Child Element</td>
    <td>If the "dragClone" option is used, this is the CSS class applied to the clone that is created.</td>
    <td>ss-cloned-child</td>
  </tr>
  <tr>
    <td>draggedClass</td>
    <td>Dragged Child Element</td>
    <td>The class applied to an element while it is being dragged.</td>
    <td>ss-dragged-child</td>
  </tr>
  <tr>
    <td>placeholderClass</td>
    <td>Placeholder Element</td>
    <td>When an item is dragged, a placeholder element is created to show the new target position.</td>
    <td>ss-placeholder-child</td>
  </tr>
  <tr>
    <td>originalContainerClass</td>
    <td>Container Element</td>
    <td>When an item is dragged, this is the class applied to the container it originated from.</td>
    <td>ss-original-container</td>
  </tr>
  <tr>
    <td>currentContainerClass</td>
    <td>Container Element</td>
    <td>When an item is dragged, this is the class applied to the container it currently is in.</td>
    <td>ss-current-container</td>
  </tr>
  <tr>
    <td>previousContainerClass</td>
    <td>Container Element</td>
    <td>When an item is dragged between containers, this is the class applied to the container it was previously in.</td>
    <td>ss-previous-container</td>
  </tr>
</table>

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