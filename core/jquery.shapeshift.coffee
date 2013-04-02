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

    # Other Options
    fillerThreshold: 10
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
      message = "Shapeshift ERROR: "

      if options.animated and !jQuery.ui
        console.error message + "You are trying to enable animation however jQuery UI has not loaded yet."
        
      if !options.autoHeight and !options.height
        console.error message + "You must specify a height if autoHeight is turned off."


    # ----------------------------
    # Init:
    # Only enable features on initialization,
    # then call a full render of the elements
    # ----------------------------
    init: ->
      @setIdentifier()
      @createEvents()
      @enableFeatures()
      @setGlobals()
      @render(true)
      @afterInit()

    
    # ----------------------------
    # setIdentifier
    # Create a random identifier to tie to this container so that
    # it is easy to unbind the specific resize event from the browser
    # ----------------------------
    setIdentifier: ->
      @identifier = "shapeshifted_container_" + Math.random().toString(36).substring(7)
      @$container.addClass(@identifier)


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
        # Only use the columns that this child can fit into
        possible_cols = col_heights.length - child.colspan + 1
        possible_col_heights = col_heights.slice(0).splice(0, possible_cols)

        # Determine the filler thresholds / cutoff
        total_children = @parsedChildren.length
        filler_threshold = @options.fillerThreshold
        filler_cutoff = child.i + filler_threshold
        filler_cutoff = total_children if filler_cutoff > total_children

        # Go over each column, lowest to highest, left to right,
        # and determine if the child is able to fit there
        chosen_col = undefined
        if current_i <= filler_cutoff
          for offset in [0..possible_cols - 1]
            col = @lowestCol(possible_col_heights, offset)
            height = col_heights[col]

            kosher = true

            # Determine if it is able to be placed at this col
            for span in [1...child.colspan]
              next_height = col_heights[col + span]

              # The next height must not be higher
              if height < next_height
                kosher = false
                break

              difference = height - next_height
              for filler_i in [current_i + 1...filler_cutoff]
                filler_child = @parsedChildren[filler_i]

                if difference >= filler_child.height
                  kosher = false
                  break

            if kosher
              chosen_col = col
              break
        else
          # Force it into position
          chosen_col = @lowestCol(possible_col_heights)
          
          highest = 0
          for span in [1...child.colspan]
            next_height = col_heights[chosen_col + span]
            if next_height > highest
              highest = next_height

          for span in [0...child.colspan]
            col_heights[chosen_col + span] = highest

        chosen_col

      recalculateSavedChildren = =>
        to_pop = []
        for saved_i in [0...savedChildren.length]
          saved_child = savedChildren[saved_i]
          saved_child.col = determineMultiposition(saved_child)

          if saved_child.col >= 0
            savePosition(saved_child)
            to_pop.push(saved_i)

        # Popeye. Lol.
        for pop_i in [to_pop.length - 1..0] by -1
          index = to_pop[pop_i]
          savedChildren.splice(index,1)

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
            child.col = @lowestCol(col_heights)
          
          # If col is undefined, it couldn't be placed, so save it
          if child.col is undefined
            savedChildren.push(child)
          else
            savePosition(child)

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
      $container = @$container
      animation_speed = @options.animationSpeed

      resizing = false
      binding = "resize." + @identifier
      $(window).on binding, =>
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
    lowestCol: (array, offset = 0) ->
      augmented_array = array.map (val, index) -> [val, index]

      augmented_array.sort (a, b) ->
          ret = a[0] - b[0]
          ret = a[1] - b[1] if ret is 0
          ret

      augmented_array[offset][1]


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
    # Destroys all the things
    # ----------------------------
    destroy: (revertChildren) ->
      @$container.off "ss-arrange"
      @$container.off "ss-destroy"
      @$container.off "ss-destroyAll"

      if revertChildren
        @$container.children().each -> $(@).css({left: 0, top: 0})

      # Remove window resize binding
      old_class = $(@).attr("class").match(/shapeshifted_container_\w+/)?[0]
      bound_indentifier = "resize." + old_class
      $(window).off(bound_indentifier)
      $(@).removeClass(old_class)

      console.info "Shapeshift has been successfully destroyed on container:", @$container 


  $.fn[pluginName] = (options) ->
    @each ->
      # Destroy any old resize events
      old_class = $(@).attr("class").match(/shapeshifted_container_\w+/)?[0]
      if old_class
        bound_indentifier = "resize." + old_class
        $(window).off(bound_indentifier)
        $(@).removeClass(old_class)

      # Create the new plugin instance
      $.data(@, "plugin_#{pluginName}", new Plugin(@, options))

)(jQuery, window, document)