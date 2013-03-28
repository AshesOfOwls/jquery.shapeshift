#  Project: jQuery.Shapeshift
#  Description: Align elements to grid with drag and drop.
#  Author: Scott Elwood
#  Maintained By: We the Media, inc.
#  License: MIT

(($, window, document) ->
  pluginName = "shapeshift"
  defaults =
    # Features
    enableResize: true

    # Animation
    animated: true
    animateOnInit: true
    animationSpeed: 120
    animationThreshold: 150

    # Grid Properties
    align: "center"
    autoHeight: true
    columns: null
    minColumns: 1
    height: 200
    gutterX: 10
    gutterY: 10
    maxHeight: null
    minHeight: 100
    paddingX: 10
    paddingY: 10
    selector: ""

  class Plugin
    constructor: (@element, options) ->
      @options = $.extend {}, defaults, options
      @globals = {}
      @$container = $ element

      @errorDetection()
      @init()


    # ----------------------------
    # errorDetection:
    # Alerts the user via the console if there
    # are confliction options
    # ----------------------------
    errorDetection: ->
      options = @options

      if !options.autoHeight and !options.height
        console.error "Shapeshift ERROR: You must specify a height if autoHeight is turned off."


    # ----------------------------
    # Init:
    # Only enable features on initialization,
    # then call a full render of the elements
    # ----------------------------
    init: ->
      @createEvents()
      @enableFeatures()
      @setGlobals()
      @render(true)
      @afterInit()


    # ----------------------------
    # createEvents:
    # Triggerable events on the container
    # which run certain functions
    # ----------------------------
    createEvents: ->
      options = @options
      $container = @$container

      $container.off("ss-arrange").on "ss-arrange", => @render(true)
      $container.off("ss-destroy").on "ss-destroy", => @destroy()
      $container.off("ss-destroyAll").on "ss-destroyAll", => @destroy(true)


    # ----------------------------
    # enableFeatures:
    # Enables options features
    # ----------------------------
    enableFeatures: ->
      @resize() if @options.enableResize


    # ----------------------------
    # setGlobals:
    # Globals that only need to be set on initialization
    # ----------------------------
    setGlobals: ->
      # Prevent initial animation if applicable
      @globals.animated = @options.animateOnInit


    # ----------------------------
    # parseChildren:
    # Collects commonly used attributes 
    # for all the active children
    # ----------------------------
    parseChildren: ->
      $children = @$container.children(@options.selector).filter(":visible")

      parsedChildren = []
      for i in [0...$children.length]
        $child = $children.eq(i)
        child =
          i: i
          el: $child
          colspan: $child.data("ss-colspan")
          height: $child.outerHeight()
        parsedChildren.push child

      @parsedChildren = parsedChildren


    # ----------------------------
    # afterInit:
    # Take care of some dirty business
    # ----------------------------
    afterInit: ->
      # Return animation to normal
      @globals.animated = @options.animated


    # ----------------------------
    # render:
    # Determine the active children and
    # arrange them to the calculated grid
    # ----------------------------
    render: (full_render) ->
      if full_render
        @parseChildren()

      @setGrid()
      @arrange()


    # ----------------------------
    # setGrid:
    # Calculates the dimensions of each column
    # and determines to total number of columns
    # ----------------------------
    setGrid: ->
      gutterX = @options.gutterX
      paddingX = @options.paddingX
      inner_width = @$container.width() - (paddingX * 2)

      # Determine single item / col width
      first_child = @parsedChildren[0]
      fc_width = first_child.el.outerWidth()
      fc_colspan = first_child.colspan
      single_width = (fc_width - ((fc_colspan - 1) * gutterX)) / fc_colspan
      @globals.col_width = col_width = single_width + gutterX

      # Determine how many columns there currently can be
      minColumns = @options.minColumns
      columns = @options.columns || Math.floor (inner_width + gutterX) / col_width
      if minColumns and minColumns > columns
        columns = minColumns
      @globals.columns = columns

      # Columns cannot exceed children
      children_count = @parsedChildren.length
      if columns > children_count
        columns = children_count

      # Calculate the child offset from the left
      @globals.child_offset = paddingX
      switch @options.align
        when "center"
          grid_width = (columns * col_width) - gutterX
          @globals.child_offset += (inner_width - grid_width) / 2

        when "right"
          grid_width = (columns * col_width) - gutterX
          @globals.child_offset += (inner_width - grid_width)


    # ----------------------------
    # arrange:
    # Animates the elements into their calcluated positions
    # ----------------------------
    arrange: ->
      console.time "Arrange"
      positions = @getPositions()

      # Arrange each child element
      for i in [0...positions.length]
        $child = @parsedChildren[i].el
        attributes = positions[i]

        if @globals.animated && @parsedChildren.length <= @options.animationThreshold
          $child.stop(true, false).animate attributes, @options.animationSpeed
        else
          $child.css attributes

      # Set the container height
      if @options.autoHeight
        container_height = @globals.container_height
        maxHeight = @options.maxHeight
        minHeight = @options.minHeight

        if minHeight and container_height < minHeight
          container_height = minHeight
        else if maxHeight and container_height > maxHeight
          container_height = maxHeight

        @$container.height container_height
      else
        @$container.height @options.height
      console.timeEnd "Arrange"
      

    # ----------------------------
    # getPositions:
    # Using the grid dimensions that have been calculated,
    # go over each child and determine which column they
    # fit into and return an array of their x/y dimensions
    # ----------------------------
    getPositions: ->
      gutterY = @options.gutterY
      paddingY = @options.paddingY

      # Store the height for each column
      col_heights = []
      for i in [0...@globals.columns]
        col_heights.push paddingY

      # Determine the columns children fit in
      positions = []
      savedChildren = []
      current_i = 0

      # ----------------------------
      # ----------------------------
      # Positioning Helper Functions
      # ----------------------------
      # ----------------------------

      # ----------------------------
      # determineMultiposition
      # Children with multiple column spans will need special
      # rules to determine if they are currently able to be
      # placed in the grid.
      # ----------------------------
      determineMultiposition = (child) =>
        col = @lowestCol(col_heights, child.colspan)
        col_height = col_heights[col]

        for j in [1..child.colspan]
          if col_heights[col + j] > col_height
            col = undefined

        col

      # ----------------------------
      # forceSave
      # In order to keep importance of children in regards to their
      # physical placement, sometimes we need to force the columns to
      # a certain height to maintain that importance
      # ----------------------------
      forceSave = (child) =>
        child.col = determineMultiposition(child)

        if child.col is undefined
          lowestCol = @lowestCol(col_heights, child.colspan)

          highest = 0
          for l in [1...child.colspan]
            height = col_heights[lowestCol + l]
            if height > highest
              highest = height

          for m in [0...child.colspan]
            col_heights[lowestCol + m] = highest

          child.col = lowestCol

        savePosition(child)

      # ----------------------------
      # recalculateSavedChildren
      # Redetermine if any saved children can be
      # placed into the grid now.
      # ----------------------------
      recalculateSavedChildren = =>
        to_pop = []
        for k in [0...savedChildren.length]
          child = savedChildren[k]

          child.col = determineMultiposition(child)

          if child.col isnt undefined
            savePosition(child)
            to_pop.push k
          else if child.i + child.colspan < current_i or current_i + child.colspan > @parsedChildren.length - 1
            forceSave(child)
            to_pop.push k

        # Remove from savedChildren array if the
        # child has been successfully saved.
        for m in [to_pop.length - 1..0] by -1
          idx = to_pop[m]
          savedChildren.splice(idx,1)

      # ----------------------------
      # savePosition
      # Takes a child which has been correctly placed in a
      # column and saves it to that final x/y position.
      # ----------------------------
      savePosition = (child) =>
        col = child.col
        offsetX = (child.col * @globals.col_width) + @globals.child_offset
        offsetY = col_heights[col]

        positions[child.i] = left: offsetX, top: offsetY
        col_heights[col] += child.height + gutterY

        if child.colspan >= 1
          for j in [1...child.colspan]
            col_heights[col + j] = col_heights[col]

      # ----------------------------
      # determinePositions
      # Iterate over all the parsed children and determine
      # the calculations needed to get its x/y value.
      # ----------------------------
      do determinePositions = =>
        for i in [0...@parsedChildren.length]
          child = @parsedChildren[i]

          # Determine the correct column
          if child.colspan > 1
            child.col = determineMultiposition(child)
          else
            child.col = @lowestCol(col_heights, child.colspan)
          
          # If col is undefined, it couldn't be placed, so save it
          if child.col is undefined
            savedChildren.push(child)

          savePosition(child)

          # Recalculate any saved children to see if they now fit
          recalculateSavedChildren()
          current_i++

      # Store the container height since we already have the data
      if @options.autoHeight
        grid_height = col_heights[@highestCol(col_heights)] - gutterY
        @globals.container_height = grid_height + paddingY

      return positions


    # ----------------------------
    # resize:
    # Optional feature.
    # Runs a full render of the elements when
    # the browser window is resized.
    # ----------------------------
    resize: ->
      animation_speed = @options.animationSpeed

      resizing = false
      $(window).on "resize.shapeshift", =>
        unless resizing
          resizing = true

          # Some funkyness to prevent too many renderings
          setTimeout (=> @render()), animation_speed / 2
          setTimeout (=> @render()), animation_speed

          setTimeout =>
            resizing = false
            @render()
          , animation_speed * 1.5


    # ----------------------------
    # lowestCol:
    # Helper
    # Returns the index position of the
    # array column with the lowest number
    # ----------------------------
    lowestCol: (array, span, offset) ->
      if span
        max = array.length - span + 1
        if max > span
          array = array.slice(0).splice(0,max)
        else
          array = array.slice(0).splice(0,1)


      if offset
        nth_smallest = array.slice(0).sort()[offset]
        $.inArray nth_smallest, array
      else
        $.inArray Math.min.apply(window,array), array


    # ----------------------------
    # highestCol:
    # Helper
    # Returns the index position of the
    # array column with the highest number
    # ----------------------------
    highestCol: (array, span) ->
      if span
        max = array.length - span + 1
        if max > span
          array = array.slice(0).splice(0,max)
        else
          array = array.slice(0).splice(0,1)

      $.inArray Math.max.apply(window,array), array 


    # ----------------------------
    # destroy:
    # Destroys all the children
    # ----------------------------
    destroy: (revertChildren) ->
      @$container.off "ss-arrange"
      @$container.off "ss-destroy"
      @$container.off "ss-destroyAll"
      $(window).off "resize.shapeshift"

      if revertChildren
        @$container.children().each -> $(@).css({left: 0, top: 0})

      console.info "Shapeshift has been successfully destroyed on container:", @$container 


  $.fn[pluginName] = (options) ->
    @each ->
      if !$.data(@, "plugin_#{pluginName}")
        $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

)(jQuery, window, document)