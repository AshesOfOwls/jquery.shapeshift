$(document).ready(function() {
  // Button group toggling
  $(".btn-group.toggle button").on("click", function() {
    console.log("!")
    $(this).siblings(".active").removeClass("active")
    $(this).addClass("active")
  })
})