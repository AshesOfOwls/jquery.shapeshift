var $containers = $(".container");

function renderChildren(placekitten) {
  // Lets generate some child divs
  $containers.children().filter(":not(.credits)").remove();
  $containers.each(function(container_i) {
    for(i=0;i<15;i++) {
      var $element = $("<div></div>"),
          height = Math.floor(Math.random() * 200) + 100,
          width = 140;
      if(container_i === 1) { height = 140; }
      if(placekitten) {
        var background = 'url("http://www.placekitten.com/'+width+'/'+height+'")';
      } else {
        var background = getRandomColor(),
            $img = $('<img src="http://fpoimg.com/'+width+'x'+Math.floor(height / 2)+'" />');
        $element.append($img);
      }
      $element.css({ background: background, height: height, width: width });
      $(this).append($element);
    }
  });
}
renderChildren(false);

// And now we can shapeshift!
$(".filter").on("click", function(e) {
  e.preventDefault();

  if($(this).hasClass("no-drag-animate")) {
    $containers.shapeshift({
      enableDragAnimation: false,
      paddingY: 20
    });
  }
  if($(this).hasClass("no-drag")) {
    $containers.shapeshift({
      enableDrag: false,
      paddingY: 20
    });
  }
  if($(this).hasClass("drag")) {
    $containers.shapeshift({
      paddingY: 20
    });
  }
  if($(this).hasClass("hide")) {
    var $objects = $containers.children().filter(":visible"),
        random = Math.round(Math.random() * $objects.size());
    $objects.eq(random).hide();
    $containers.shapeshift({
      paddingY: 20
    });
  }
  if($(this).hasClass("show")) {
    var $objects = $containers.children().filter(":hidden"),
        random = Math.round(Math.random() * $objects.size());
    $objects.eq(random).show();
    $containers.shapeshift({
      paddingY: 20
    });
  }
  if($(this).hasClass("placekittens")) {
    renderChildren(true);
    $containers.shapeshift({
      paddingY: 20
    });
  }
})
$containers.shapeshift({
  paddingY: 20
});

function getRandomColor() {
  var letters = 'ABCDEF'.split('');
  var color = '#';
  for (var i=0;i<6;i++) {
    color += letters[Math.round(Math.random() * 5)];
  }
  return color;
}
