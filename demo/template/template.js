$(document).ready(function() {
  // Showing more Info
  var closed = true;
  $(".more-info .togglebar div").on("click", function() {
    $more_info_container = $(this).closest(".more-info").find("ul");
    if(closed) {
      $more_info_container.show()
      $(this).text("Less Info");
    } else {
      $more_info_container.hide()
      $(this).text("More Info");
    }
    closed = !closed;
  })

  // Toggling button groups
  $('.filters .btn-group.toggle button').on("click", function() {
    $(this).siblings(".active").removeClass("active");
    $(this).addClass("active");
  })

})