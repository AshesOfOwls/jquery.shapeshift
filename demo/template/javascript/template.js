$(function() {
  // Button group toggling
  $("ul.btn-group.toggle li").on("click", function() {
    $(this).siblings(".active").removeClass("active")
    $(this).addClass("active")
  })

  var details_closed = true;
  $("header .details a.toggle").on("click", function() {
    if(details_closed) {     
      $(this).siblings("ul").fadeIn(200)
    } else {
      $(this).siblings("ul").fadeOut(200)
    }
    details_closed = !details_closed;
  })
})