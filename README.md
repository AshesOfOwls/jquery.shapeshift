Shapeshift
==========

Inspired heavily by the jQuery Masonry plugin (http://masonry.desandro.com/), Shapeshift is a plugin which will dynamically arrange a collection of elements into a grid in their parent container. An example of this behaviour is what you can find at sites like http://www.pinterest.com.

Shapeshift is intended to be a very bare bones version of these grid systems, however one specific feature makes it stand out from the rest...

#### Drag and Drop

A unique functionality to Shapeshift is the ability to drag and drop items within the dynamic grid.

Check out an example here: INSERT EXAMPLE LINK.

## Getting Started

### Dependencies

Shapeshift requires the latest version of jQuery, and the drag and drop functionality requires jQuery UI Draggable/Droppable libraries, of which is included.

### Setting Up the Parent Container

Objects that get shapeshifted will be absolutely positioned in their parent container. Therefore the parent container must be set to position: relative for the objects to position themselves correctly.

```html
<div id="container" style="position: relative;"></div>
```