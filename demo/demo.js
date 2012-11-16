// Lets generate some child divs
var $container = $("#container");
for(i=0;i<100;i++) {
  var $element = $("<div></div>"),
      height = Math.floor(Math.random() * 350) + 100,
      color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  $element.css({
    height: height,
    background: color
  });
  $container.append($element);
}

// And now we can shapeshift!

$(".filter").on("click", function(e) {
  e.preventDefault();

  if($(this).hasClass("no-drag-animate")) {
    $container.shapeshift({animatedOnDrag: false});
  }
  if($(this).hasClass("no-drag")) {
    $container.shapeshift({draggable: false});
  }
  if($(this).hasClass("drag")) {
    $container.shapeshift();
  }
  if($(this).hasClass("hide")) {
    var $objects = $container.children().filter(":visible"),
        random = Math.round(Math.random()*7);
    $objects.eq(random).hide();
    $("#container").shapeshift();
  }
  if($(this).hasClass("show")) {
    var $objects = $container.children().filter(":hidden"),
        random = Math.round(Math.random()*3);
    $objects.eq(random).show();
    $("#container").shapeshift();
  }
})
$("#container").shapeshift();