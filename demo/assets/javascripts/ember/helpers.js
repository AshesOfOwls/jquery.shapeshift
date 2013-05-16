Ember.Handlebars.registerHelper('gist', function(gist_id) {
  gist_url = 'https://gist.github.com/'+gist_id
  gist_html = "Could not load the gist. You can find it at this url: " +
              '<a href="'+gist_url+'">'+gist_url+'</a>'

  $.ajax({ 
    url: gist_url+'.json', 
    dataType: 'jsonp', 
    async: false,
    success: function(data) {
      $("head").append('<link href=\"'+data.stylesheet+'\" media=\"screen\" rel=\"stylesheet\" />')

      $("."+gist_id).html(data.div)
    } 
  });

  return new Handlebars.SafeString('<div class="'+gist_id+'">'+gist_html+'</div>')
})