// Lets generate some child divs
for(i=0;i<100;i++) {
  var $container = $("#container"),
      $element = $("<div></div>"),
      height = Math.floor(Math.random() * 350) + 100,
      color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  $element.css({
    height: height,
    background: color
  });
  $container.append($element);
}

// And now we can shapeshift!
$("#container").shapeshift();