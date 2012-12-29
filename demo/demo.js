$(document).ready(function() {
  var $containers = $(".container");

  // ----------------------------------------------------------------------
  // - Generate some fake elements
  // ----------------------------------------------------------------------

  // This just renders us some random temporary children
  function renderChildren(placekitten) {
    $containers.children().filter(":not(.credits)").remove();
    $containers.each(function(container_i) {
      for(i=0;i<15;i++) {
        var $element = $("<div class='object'></div>"),
            height = Math.floor(Math.random() * 200) + 100,
            width = $containers.children().first().width();
        if(container_i === 1) { height = 140; }
        if(placekitten) {
          var background = 'url("http://www.placekitten.com/'+width+'/'+height+'")';
        } else {
          var background = 'url("http://fpoimg.com/'+width+'x'+height+'?bg_color='+getRandomColor()+'&text_color=444444")';
        }
        $element.css({ background: background, height: height });
        $(this).append($element);
      }
    });
  }
  renderChildren(false);

  function getRandomColor() {
    var letters = 'ABCDEF'.split('');
    var color = '';
    for (var i=0;i<6;i++) {
      color += letters[Math.round(Math.random() * 5)];
    }
    return color;
  }

  // Initial Shapeshift
  $containers.shapeshift({
    paddingY: 20
  });

  // ----------------------------------------------------------------------
  // - Clicking the filter options
  // ----------------------------------------------------------------------

  $(".filters .dnd button").on("click", function() {
    switch($(this).data("attr")) {
      case "drag":
        options = {
          paddingY: 20
        }
        break;
      case "no-drag":
        options = {
          enableDrag: false,
          paddingY: 20
        }
        break;
      case "no-drag-animate":
        options = {
          enableDragAnimation: false,
          paddingY: 20
        }
        break;
    }
    $containers.shapeshift(options);
  });

  $(".filters .filtering button").on("click", function() {
    switch($(this).data("attr")) {
      case "hide":
        $objects = $containers.children().filter(":visible");
        random = Math.round(Math.random() * $objects.size());
        $objects.eq(random).hide();
        break;
      case "show":
        $objects = $containers.children().filter(":hidden");
        random = Math.round(Math.random() * $objects.size());
        $objects.eq(random).show();
        break;
    }
  });

  $(".filters .placeholders button").on("click", function() {
    switch($(this).data("attr")) {
      case "fpoimg":
        renderChildren(false);
        $(".filters .dnd button").first().trigger("click")
        break;
      case "placekittens":
        renderChildren(true);
        $(".filters .dnd button").first().trigger("click")
        break;
    }

    $containers.trigger("ss-event-arrange")
  });

  // ----------------------------------------------------------------------
  // - Drag and Drop events for shapeshift
  // ----------------------------------------------------------------------

  $containers.on("ss-event-dropped", function(e, selected) {
    var $selected = $(selected)
    // console.log("The dropped item is:", $selected)

    // Get the index position of each object
    $objects = $(this).children();
    $objects.each(function(i) {
      // console.log("Get the index position:", i)
      // console.log("Get the current element:", $(this))
    });
  });

  $containers.on("ss-event-dragged", function(e, selected) {
    var $selected = $(selected);
    // console.log("This is the item being dragged:", $selected);
  });
});