$(document).ready(function() {
  var $containers = $(".ss-container"),
      child_count = 30;

  // ----------------------------------------------------------------------
  // - Generate some fake elements
  // ----------------------------------------------------------------------

  function renderChildren() {
    $containers.each(function() {
      for(var i=0;i<child_count;i++) {
        var colspan = Math.ceil(Math.random() * 2),
            $element = $("<li data-ss-colspan="+colspan+"></li>"),
            height = colspan * 80 + ((colspan - 1) * 12);
        $element.height(height);
        $(this).append($element);
      }
    })
  }

  function renderPlaceholders(placekitten) {
    $containers.each(function() {
      var $children = $(this).children().not(".credits"),
          child_count = $children.length;
      for(var i=0;i<child_count;i++) {
        var $child = $($children[i]),
            height = $child.height(),
            width = $child.width();

        if(placekitten) {
          var background = 'url("http://www.placekitten.com/'+width+'/'+height+'")';
        } else {
          var background = 'url("http://fpoimg.com/'+width+'x'+height+'?bg_color='+getRandomColor()+'&text_color=444444")';
        }
        $child.css({ backgroundImage: background, height: height });
      }
    })
  }
  renderChildren();
  renderPlaceholders();

  function getRandomColor() {
    var letters = 'ABCDEF'.split('');
    var color = '';
    for (var i=0;i<6;i++) {
      color += letters[Math.round(Math.random() * 5)];
    }
    return color;
  }

  // Initial Shapeshift
  $containers.shapeshift();

  // ----------------------------------------------------------------------
  // - Clicking the filter options
  // ----------------------------------------------------------------------

  var filter_options = {};

  $(".options ul.animation li").on("click", function() {
    var option = $(this).data("option");

    if(option === "enable") {
      filter_options.enableAnimation = true;
    } else {
      filter_options.enableAnimation = false;
    }

    $containers.shapeshift(filter_options);
  });

  $(".options ul.dragndrop li").on("click", function() {
    var option = $(this).data("option");

    if(option === "enable") {
      filter_options.enableAnimation = true;
    } else {
      filter_options.enableAnimation = false;
    }

    $containers.shapeshift(filter_options);
  });

  $(".options ul.filtering li").on("click", function() {
    var option = $(this).data("option");

    if(option === "hide") {
      $containers.children(":visible").sort(function(){ 
        return Math.round(Math.random())-0.5
      }).first().hide();
    } else {
      $containers.children(":hidden").sort(function(){ 
        return Math.round(Math.random())-0.5
      }).first().show();
    }

    $containers.trigger("ss-arrange");
  });

  $(".options ul.placeholders li").on("click", function() {
    var option = $(this).data("option");

    if(option === "fpoimg") {
      renderPlaceholders(false);
    } else {
      renderPlaceholders(true);
    }

    $containers.shapeshift(filter_options);
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