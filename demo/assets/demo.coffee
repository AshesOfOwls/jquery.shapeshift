$ ->
  $containers = $(".ss-container")
  child_count = 30

  # -------------
  # Render Dummy Content
  # -------------

  do renderChildren = ->
    weighted_colspans = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,3,3]

    $containers.each ->
      for i in [0...child_count]
        colspan = weighted_colspans[Math.floor(Math.random() * weighted_colspans.length)]
        $element = $("<li data-ss-colspan="+colspan+"><div class='position'><div>"+i+"</div></div></li>")
        height = colspan * 80 + ((colspan - 1) * 12)
        # height = Math.random() * 100 + 100
        $element.height(height);
        $(this).append($element);

    $containers.children().on "mouseenter mouseleave", (e) ->
      if $("ul.toggle.placeholders li.active").data("option") isnt "index"
        switch e.type
          when "mouseenter"
            $(@).find(".position").show()
          when "mouseleave"
            $(@).find(".position").hide()

  getRandomColor = ->
    letters = 'ABCDEF'.split('')
    color = ''
    for i in [0...letters.length]
      color += letters[Math.round(Math.random() * 5)]
    color

  do renderPlaceholders = (type = "fpoimg") ->
    $containers.each ->
      $children = $(this).children().not(".credits")
      child_count = $children.length

      for i in [0...child_count]
        $child = $($children[i])
        height = $child.height()
        width = $child.width()

        if child_count > 50
          type = "indexes"


        $(@).children().each ->
          $(@).find(".position").hide()

        switch type
          when "fpoimg"
            background = 'url("http://fpoimg.com/'+width+'x'+height+'?bg_color='+getRandomColor()+'&text_color=444444")'
          when "placekittens"
            background = 'url("http://www.placekitten.com/'+width+'/'+height+'")'
          when "index"
            $(@).children().each ->
              $(@).find(".position").show()

        $child.css
          backgroundImage: background
          height: height

  # -------------
  # Initial Shapeshift
  # -------------

  filter_options =
    minColumns: 3

  $containers.shapeshift(filter_options)

  # -------------
  # Clicking the filter options
  # -------------

  $(".options ul.animation li").on "click", ->
    switch $(this).data "option"
      when "enable"
        filter_options.animated = true
      else
        filter_options.animated = false

    $containers.shapeshift filter_options

  $(".options ul.dragndrop li").on "click", ->
    switch $(this).data "option"
      when "enable"
        filter_options.animated = true
      else
        filter_options.animated = false

    $containers.shapeshift filter_options

  $(".options ul.filtering li").on "click", ->
    switch $(this).data "option"
      when "hide"
        $containers.children(":visible").sort( ->
          Math.round(Math.random())-0.5
        ).first().hide()
      else
        $containers.children(":hidden").sort( ->
          Math.round(Math.random())-0.5
        ).first().hide()

    $containers.trigger "ss-arrange"

  $(".options ul.placeholders li").on "click", ->
    renderPlaceholders $(this).data("option")

    $containers.shapeshift filter_options

  # -------------
  # Drag and Drop events for shapeshift
  # -------------

  $containers.on "ss-event-dropped", (e, selected) ->
    $selected = $(selected)
    # console.log "The dropped item is:", $selected

    # Get the index position of each object
    $objects = $(@).children()
    $objects.each (i) ->
      # console.log "Get the index position:", i
      # console.log "Get the current element:", $(@)

  $containers.on "ss-event-dragged", (e, selected) ->
    $selected = $(selected);
    # console.log "This is the item being dragged:", $selected
