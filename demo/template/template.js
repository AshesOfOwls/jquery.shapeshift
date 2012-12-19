$(document).ready(function() {
  $('.filters .btn-group.toggle button').on("click", function() {
    $(this).siblings(".active").removeClass("active");
    $(this).addClass("active");
  })
})