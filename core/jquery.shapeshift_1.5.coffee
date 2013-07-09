#  Project: jQuery.Shapeshift
#  Description: Align elements to grid with drag and drop.
#  Author: Scott Elwood
#  Maintained By: We the Media, inc.
#  License: MIT

(($, window, document) ->
  pluginName = "shapeshift"
  defaults =
    # The Basics
    selector: "*"

    # Features
    enableResize: true
    cssAnimations: true

    # Grid Properties
    align: "center"
    columns: null
    colWidth: null
    gutterX: 10
    gutterY: 10

    states:
      init:
        style:
          marginTop: -1200
          opacity: 0
      normal:
        animated: true
        speed: 200
        staggeredIntro: false
        style:
          marginTop: 0
          opacity: 1

  class Plugin
    constructor: (@element, options) ->
      @options = $.extend {}, defaults, options
      @$container = $(element)

      @grid = {} # Stores properties about the grid

      @state = null

      if @errorCheck()
        @init()

    # ----------------------------
    # errorCheck:
    # Determine if there are any conflicting options
    # ----------------------------
    errorCheck: ->
      return true

    # ----------------------------
    # Init:
    # Only enable features on initialization,
    # then call a full render of the elements
    # ----------------------------
    init: ->
      @enableFeatures()
      @createEvents()
      @setParsedChildren()
      @initializeGrid()
      @calculateGrid()
      @render()

    # ----------------------------
    # enableFeatures:
    # Enables options features
    # ----------------------------
    enableFeatures: ->
      @enableResize() if @options.enableResize

    # ----------------------------
    # createEvents:
    # Triggerable events on the container
    # which run certain functions
    # ----------------------------
    createEvents: ->
      @$container.off("ss-arrange").on "ss-arrange", => @arrange()
      @$container.off("ss-setState").on "ss-setState", (e, state) => @setState(state)
      
    # ----------------------------
    # setParsedChildren:
    # Calculates and returns commonly used 
    # attributes for all the active children
    # ----------------------------
    setParsedChildren: ->
      $children = @$container.children(@options.selector)
      total = $children.length

      parsedChildren = []
      for i in [0...total]
        $child = $($children[i])
        parsedChildren.push
          i: i
          el: $child
          colspan: parseInt($child.attr("data-ss-colspan")) || 1
          height: $child.outerHeight()
      @parsedChildren = parsedChildren
      
    # ----------------------------
    # initializeGrid:
    # Determines the initial properties for
    # the grid / column layout.
    # ----------------------------
    initializeGrid: ->
      gutter_x = @options.gutterX

      # Determine the width of one column
      if @options.colWidth
        @grid.col_width = @options.colWidth + gutter_x
      else
        first_child = @parsedChildren[0]
        fc_width = first_child.el.outerWidth()
        fc_colspan = first_child.colspan
        single_width = (fc_width - ((fc_colspan - 1) * gutter_x)) / fc_colspan
        @grid.col_width = single_width + gutter_x

      # Get the grid padding  
      @grid.padding_left = parseInt @$container.css("padding-left")
      @grid.padding_right = parseInt @$container.css("padding-right")
      @grid.padding_top = parseInt @$container.css("padding-top")
      @grid.padding_bottom = parseInt @$container.css("padding-bottom")


    # ----------------------------
    # calculateGrid:
    # Determines the number of columns
    # ----------------------------
    calculateGrid: ->
      col_width = @grid.col_width

      # Determine how many columns can exist
      container_inner_width = @$container.width()
      columns = @options.columns || Math.floor container_inner_width / col_width

      # The columns cannot outnumber the children
      if columns > @parsedChildren.length
        columns = @parsedChildren.length

      @grid.columns = columns

      # Determine the left offset of children
      child_offset = @grid.padding_left

      grid_width = (columns * col_width) - @options.gutterX
      switch @options.align
        when "center"
          child_offset += (container_inner_width - grid_width) / 2

        when "right"
          child_offset += (container_inner_width - grid_width)

      @grid.child_offset = child_offset


    # ----------------------------
    # getPositions:
    # Takes the parsed children and determines
    # what x/y position they should be in
    # ----------------------------
    getPositions: ->
      col_width = @grid.col_width
      gutter_y = @options.gutterY
      padding_top = @grid.padding_top

      # Array that stores the height of each column
      col_heights = []
      columns = @grid.columns
      for i in [0...columns]
        col_heights.push(padding_top)

      # Go over each child and determine its position
      positions = []
      total_children = @parsedChildren.length
      offset_left = @grid.child_offset
      for i in [0...total_children]
        child = @parsedChildren[i]
        col = @lowestCol(col_heights)

        left = (col * col_width) + offset_left
        top = col_heights[col]

        positions[child.i] = { 
          left: left, 
          top: top
        }

        col_heights[col] += child.height + gutter_y

      # Store the height of the grid
      @grid.height = @highestCol(col_heights) - gutter_y - padding_top

      return positions


    # ----------------------------
    # arrange:
    # Physically moves the children into their
    # respective positions
    # ----------------------------
    arrange: ->
      animated = @state.animated
      staggeredIntro = @state.staggeredIntro
      state_style = @state.style
      speed = @state.speed

      animated = false if animated and @options.cssAnimations

      # Make sure the grid is correct and then
      # retrieve the positions of the children
      positions = @getPositions()
      
      # Animate the container to the appropriate height
      @$container.css({ height: @grid.height })

      # Animate the Children
      total_children = @parsedChildren.length

      for i in [0...total_children]
        $child = @parsedChildren[i].el
        position = positions[i]

        $.extend(position, state_style) if state_style

        if staggeredIntro
          @stagger(i, $child, position, animated, speed)
        else
          @move($child, position, animated, speed)

    stagger: (i, $child, position, animated, speed) ->
      setTimeout =>
        @move($child, position, animated, speed)
      , 20 * i

    move: ($child, position, animated, speed) ->
      if animated
        $child.stop(true, false).animate(position, speed)
      else
        no_transitions = @options.cssAnimations and !@state.animated
        
        $child.toggleClass('no-transition') if no_transitions

        $child.css(position)

        if no_transitions
          setTimeout ->
            $child.toggleClass('no-transition')
          , 0


    # ----------------------------
    # setState:
    # Make the child elements a specific style / state
    # ----------------------------
    setState: (state_name) ->
      @state = state = $.extend({}, @options["states"][state_name])
      @arrange()
      @state.staggeredIntro = false

      
    # ----------------------------
    # render:
    # The intial render of the elements
    # ----------------------------
    render: ->
      @setState("init")
      @setState("normal")

    # ----------------------------
    # lowestCol:
    # Helper
    # Returns the index position of the
    # array column with the lowest number
    # ----------------------------
    lowestCol: (array) ->
      $.inArray Math.min.apply(window,array), array

    # ----------------------------
    # highestCol:
    # Helper
    # Returns the index position of the
    # array column with the highest number
    # ----------------------------
    highestCol: (array) ->
      array[$.inArray Math.max.apply(window,array), array]


    # ----------------------------
    # resize:
    # Optional feature.
    # Runs a full render of the elements when
    # the browser window is resized.
    # ----------------------------
    enableResize: ->
      resizing = false

      $(window).on "resize", =>
        unless resizing
          speed = @state.speed
          resizing = true

          setTimeout =>
            @calculateGrid()
            @arrange()
          , speed * .6

          setTimeout =>
            @calculateGrid()
            @arrange()
            resizing = false
          , speed * 1.1


  $.fn[pluginName] = (options) ->
    @each ->
      # Create the new plugin instance
      $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

)(jQuery, window, document)