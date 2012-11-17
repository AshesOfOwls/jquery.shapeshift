function getRandomColor() {
  var letters = 'ABCDEF'.split('');
  var color = '#';
  for (var i=0;i<6;i++) {
    color += letters[Math.round(Math.random() * 5)];
  }
  return color;
}

// Lets generate some child divs
var $container = $(".container");
$container.each(function() {
  for(i=0;i<20;i++) {
    var $element = $("<div></div>"),
        height = Math.floor(Math.random() * 200) + 100,
        width = 200,
        color = getRandomColor(),
        $img = $('<img src="http://placehold.it/'+width+'x'+Math.floor(height / 2)+'" />');
    $element.css({
      height: height,
      background: color
    });
    $(this).append($element);
    $element.append($img);
  }
})

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
    $(".container").shapeshift();
  }
  if($(this).hasClass("show")) {
    var $objects = $container.children().filter(":hidden"),
        random = Math.round(Math.random()*3);
    $objects.eq(random).show();
    $(".container").shapeshift();
  }
  if($(this).hasClass("placekittens")) {
    $container.each(function() {
      var $objects = $(this).children().filter(":visible");
      $objects.each(function(i) {
        var width = $(this).outerWidth(),
            height = $(this).outerHeight(),
            $img = $('<img src="http://www.placekitten.com/'+width+"/"+height+'" width="'+width+'" height="'+height+'" />');

        $img.css({
          left: $(this).position().left,
          top: $(this).position().top,
          position: "absolute"
        })
        $container.append($img);
        $(this).remove();

        if(i === $objects.length - 1) {
          setTimeout(function() {
            $(".container").shapeshift();
          }, 300);
        }
      })
    })
  }
})
$(".container").shapeshift();