$(document).ready(function() {
  $('.filter button').on("click", function() {
    if($(this).parent().hasClass("toggle")) {
      $(this).siblings(".active").removeClass("active");
      $(this).addClass("active");
    }
  })
})