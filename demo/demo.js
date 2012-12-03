var $containers = $(".container");

// This just renders us some random temporary children
function renderChildren(placekitten) {
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

function getRandomColor() {
  var letters = 'ABCDEF'.split('');
  var color = '#';
  for (var i=0;i<6;i++) {
    color += letters[Math.round(Math.random() * 5)];
  }
  return color;
}

// Initial Shapeshift
$containers.shapeshift({
  paddingY: 20
});

// When our buttons are clicked.
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

$containers.on("ss-event-dropped", function(e, selected) {
  // Get the new position for the dropped item
  var position = $(selected).index();
  console.log("The dropped position:", position)

  // Get the index position of each object
  console.log("Child positions:")
  $objects = $(this).children();
  $objects.each(function(i) {
    position[i] = $(this).index();
    console.log($(this).index())
  });
});