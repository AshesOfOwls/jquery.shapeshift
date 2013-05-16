Demo.ApplicationView = Ember.View.extend({
  templateName: 'layouts/application'
});

Demo.SimpleView = Ember.View.extend({
  templateName: 'examples/simple/index',
  didInsertElement: function() {

    pikit_options = {
      service: 'fpoimg',
      height: [100, 300],
      backColor: 'pastel',
      foreColor: '333333'
    }

    ss_options = {
      minColumns: 3
    }

    $container = $(".ss-container");
    $children = $container.children();
    $children.pikit(pikit_options)
    $container.first().children().shuffle();

    $container.shapeshift(ss_options)

    $(".controls").off().on("changed", function(e, options) {
      attr = options.attribute
      val = options.value

      switch(attr) {
        case 'animation':
          ss_options.animated = val
          $container.shapeshift(ss_options)
          break;

        case 'dragndrop':
          ss_options.enableDrag = val
          ss_options.enableCrossDrop = val
          $container.trigger('ss-destroy')
          $container.shapeshift(ss_options)
          break;

        case 'filtering':
          if(val === "hide") {
            $container.children(":visible").sort(function() {
              return Math.round(Math.random()) - 0.5;
            }).first().hide();
          } else {
            $container.children(":hidden").sort(function() {
              return Math.round(Math.random()) - 0.5;
            }).first().show();
          }

          $container.trigger("ss-rearrange")
          break;

        case 'placeholders':
          pikit_options.service = val
          pikit_options.height = null
          $container.children().pikit(pikit_options)
          break;

        case 'indexes':
          if(val) {
            $container.children().each(function() {
              $(this).prepend('<div class="position">'+$(this).index()+'</div>')
            });

            $container.on("ss-arranged", function(e, selected) {
              modifier = $(this).find(".ss-dragging")[0] ? 1 : 0

              $(this).children().each(function() {
                $(this).find(".position").html($(this).index() - modifier)
              })
            });
          } else {
            $container.find(".position").remove()
          }
      }
    })
  }
});

Demo.MosaicView = Ember.View.extend({
  templateName: 'examples/mosaic/index',
  didInsertElement: function() {
    $container = $(".ss-container");
    $children = $container.children();
    $children.pikit({ service: 'placekitten', height: [100, 300] })
    $children.shuffle();
    $container.shapeshift({
      gutterX: 0,
      gutterY: 0,
      paddingX: 0,
      paddingY: 0,
      minColumns: 3
    })
  }
});

Demo.TrashView = Ember.View.extend({
  templateName: 'examples/trash/index',
  didInsertElement: function() {
    $container = $(".ss-container.trash");
    $trash = $(".ss-container.trash_bin");
    $children = $container.children();
    $children.pikit({ service: 'placezombies', height: [100, 300] })
    $children.shuffle();
    $container.shapeshift()
    $trash.shapeshift({
      autoHeight: false,
      colWidth: 80,
      enableTrash: true
    })
  }
});

Demo.ControlsView = Ember.View.extend({
  templateName: 'examples/simple/index',
  didInsertElement: function() {
    // Button group toggling
    $(".btn-group.toggle button").on("click", function() {
      $(this).siblings(".active").removeClass("active")
      $(this).addClass("active")
    })
    
    // Enable bootstrap switch elements
    $(".switch").bootstrapSwitch();

    // Listen for control changes
    $(".controls .switch").on("switch-change", function(e, data) {
      var options = {
            attribute: $(data.el).closest("li").data("option"),
            value: data.value
          }
      $(".controls").trigger("changed", options)
    })

    $(".controls li .btn").on("click", function() {
      var options = {
            attribute: $(this).closest("li").data("option"),
            value: $(this).data("value")
          }
      $(".controls").trigger("changed", options)
    })
  }
});

