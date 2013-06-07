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

    # Grid Properties
    align: "center"
    columns: null
    colWidth: null
    gutterX: 10
    gutterY: 10

    # Animation Settings
    animated: true
    animateOnInit: false
    animateInStyle: "fadein"

  # Create a style to ignore CSS transitions
  style = $('<style>
              .ss-notransitions { 
                -webkit-transition: none !important;
                -moz-transition: none !important;
                -o-transition: none !important;
                transition: none !important;
              }
            </style>')
  $('html > head').append(style);

  class Plugin
    constructor: (@element, options) ->
      @options = $.extend {}, defaults, options
      @$container = $(element)

      @grid = {} # Stores properties about the grid

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

        offset_x = (col * col_width) + offset_left
        offset_y = col_heights[col]

        positions[child.i] = { 
          left: offset_x, 
          top: offset_y
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
    arrange: (style_options) ->
      # Make sure the grid is correct and then
      # retrieve the positions of the children
      @calculateGrid()
      positions = @getPositions()
      
      # Animate the container to the appropriate height
      @$container.css({ height: @grid.height })

      # Animate the Children
      total_children = @parsedChildren.length
      for i in [0...total_children]
        $child = @parsedChildren[i].el
        position = positions[i]

        if style_options
          if style_options.top
            position.top = position.top + style_options.top
          if style_options.left
            position.left += style_options.left
          if style_options.opacity >= 0
            position.opacity = style_options.opacity

        console.log(position)
        $child.css(position, 200)


    # ----------------------------
    # render:
    # The intial render of the elements
    # ----------------------------
    render: ->
      # Toggle Animations
      if !@options.animateOnInit or !@options.animated
        @toggleCssTransitions(false)
      
      if @options.animateInStyle
        @toggleCssTransitions(false)

        switch @options.animateInStyle
          when "fadein"
            @arrange({top: -120, opacity: 0})

        setTimeout( =>
          @toggleCssTransitions(true)
          @arrange({opacity: 1})
        , 200 )
      else
        # Arrange the elements to their exact positions
        @arrange()

        # Toggle Animations
        if @options.animated
          @toggleCssTransitions(true)

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
    # toggleCssTransitions:
    # Sometimes CSS transitions need to be
    # turned off. There was a style created
    # at the beginning of the page.
    # ----------------------------
    toggleCssTransitions: (enabled) ->
      if enabled
        $(".ss-notransitions").removeClass("ss-notransitions")
      else
        @$container.addClass("ss-notransitions")
        @$container.children().addClass("ss-notransitions")


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
          resizing = true

          setTimeout =>
            resizing = false
            @arrange()
          , 100


  $.fn[pluginName] = (options) ->
    @each ->
      # Create the new plugin instance
      $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

)(jQuery, window, document)