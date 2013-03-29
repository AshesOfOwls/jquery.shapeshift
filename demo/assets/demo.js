$(document).ready(function() {
  var $containers = $(".ss-container");
  
  // Initial Shapeshift
  var filter_options = {
    minColumns: 3
  };

  $containers.shapeshift(filter_options);

  // ----------------------------------------------------------------------
  // - Clicking the filter options
  // ----------------------------------------------------------------------

  $(".options ul.animation li").on("click", function() {
    var option = $(this).data("option");

    if(option === "enable") {
      filter_options.animated = true;
    } else {
      filter_options.animated = false;
    }

    $containers.shapeshift(filter_options);
  });

  $(".options ul.dragndrop li").on("click", function() {
    var option = $(this).data("option");

    if(option === "enable") {
      filter_options.animated = true;
    } else {
      filter_options.animated = false;
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