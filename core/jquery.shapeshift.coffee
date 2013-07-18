# ----------------------------------------------------------------------
#  Project: jQuery.Shapeshift
#  Description: Align elements to a column grid with drag and drop.
#  Author: Scott Elwood
#  Maintained By: We the Media, inc.
#  License: MIT
# ----------------------------------------------------------------------

(($, window, document, undefined_) ->
  pluginName = "shapeshift"

  defaults = 
    # Features
    enableResize: true
    resizeRate: 300
    cssAnimations: false

    # States
    state: 'default'
    states:
      default:

        animated: false
        animateSpeed: 100
        transitionsClass: 'default_state'

        staggerInit: true
        staggerSpeed: 20

        grid:
          align: 'center'
          columns: null
          colWidth: null
          gutter: [10, 10]

        initStyle:
          opacity: 0
          
        style:
          opacity: 1

      other:
        animated: true
        animateSpeed: 100
        transitionsClass: 'other_state'

        grid:
          align: 'center'
          columns: null
          colWidth: null
          gutter: [20, 10]

        initStyle:
          opacity: 0
          
        style:
          background: 'blue'
          opacity: 1

  Plugin = (element, options) ->
    @options = $.extend({}, defaults, options)
    @grid = {}

    @$container = $(element)
    @children = []

    @stagger_queue = []
    @stagger_interval = null

    @state = null

    @init()

  Plugin:: =
    init: ->
      @_setState()
      @_enableFeatures()
      @_parseChildren()
      @_initializeGrid()
      @_arrange()


    # ----------------------------------------------------------------------
    # --------------------------- Public Methods ---------------------------
    # ----------------------------------------------------------------------

    # ----------------------------------------------
    # insert
    #
    # Insert a new child into the container
    #
    # $child: The element to be inserted 
    #      i: The position to be inserted into
    # ----------------------------------------------
    insert: ($child, i) ->
      # Append to the end by default
      i = 999999 if i is undefined

      @$container.append($child)
      @_parseChild($child, i)
      @_calculateGrid()
      @_arrange()

    # ----------------------------------------------
    # insertMany
    #
    # Insert multiple new children into this 
    # container
    #
    # children: An array of children which is
    #           formatted as such:
    #           [[$child, index], [$child, index]]
    # ----------------------------------------------
    insertMany: (children) ->
      for child in children
        $child = child[0]
        index = child[1] || 999999 # Append to the end by default

        @$container.append($child)
        @_parseChild($child, index)

      @_calculateGrid()
      @_arrange()


    # ----------------------------------------------
    # setState:
    # Change the currently active state
    # ----------------------------------------------
    setState: (state_name) ->
      state = @options.states[state_name]

      if state
        @_setState(state_name)
        @_arrange()
      else
        console.error("Shapeshift does not recognize the state '#{state_name}', are you sure it's defined?")


    # ----------------------------------------------------------------------
    # -------------------------- Private Methods ---------------------------
    # ----------------------------------------------------------------------

    # ----------------------------------------------
    # enableFeatures:
    # Enables options features
    # ----------------------------------------------
    _enableFeatures: ->
      @enableResize() if @options.enableResize


    # ----------------------------------------------
    # setState:
    # Change the currently active state
    # ----------------------------------------------
    _setState: (state = @options.state) ->
      if @state
        # Clear the old state
        @$container.find("." + @state.transitionsClass).removeClass(@state.transitionsClass)
        add_classes = true

      @state = @options.states[state]

      if add_classes
        for child in @children
          child.el.addClass(@state.transitionsClass)


    # ----------------------------------------------
    # parseAllChildren
    #
    # Go over every child element in the container
    # and add it to the global children array
    # ----------------------------------------------
    _parseChildren: ->
      $children = @$container.children()
      child_count = $children.length

      for i in [0...child_count]
        $child = $($children[i])
        @_parseChild($child, i)

      @


    # ----------------------------------------------
    # parseChild
    #
    # Add a single childs properties to a specific
    # index position in the children array
    #
    # $child: The element to be inserted 
    #      i: The position to be inserted into
    # ----------------------------------------------
    _parseChild: ($child, i) ->
      @children.splice i, 0,
        el: $child
        colspan: parseInt($child.attr("data-ss-colspan")) || 1
        height: $child.outerHeight()
        position: null
        initialized: false


    # ----------------------------------------------
    # initializeGrid
    #
    # Determines the initial grid properties
    # ----------------------------------------------
    _initializeGrid: ->
      grid_state = @state.grid
      gutter_x = grid_state.gutter[0]

      if grid_state.colWidth
        # Column width is manually set
        @grid.col_width = grid_state.colWidth + gutter_x
      else
        # Column width is automatically determined
        first_child = @children[0]
        fc_width = first_child.el.outerWidth()
        fc_colspan = first_child.colspan
        single_width = (fc_width - ((fc_colspan - 1) * gutter_x)) / fc_colspan
        @grid.col_width = single_width + gutter_x

      # Get the grid padding via CSS 
      @grid.padding_left = parseInt @$container.css("padding-left")
      @grid.padding_right = parseInt @$container.css("padding-right")
      @grid.padding_top = parseInt @$container.css("padding-top")
      @grid.padding_bottom = parseInt @$container.css("padding-bottom")

      @_calculateGrid()


    # ----------------------------------------------
    # calculateGrid:
    #
    # Some properties of the grid have to be
    # calculated dynamically, such as when the
    # container is resized.
    # ----------------------------------------------
    _calculateGrid: ->
      grid_state = @state.grid
      col_width = @grid.col_width

      # Determine how many columns can exist
      container_inner_width = @$container.width()
      columns = grid_state.columns || Math.floor container_inner_width / col_width

      # The columns cannot outnumber the children
      columns = @children.length if columns > @children.length

      @grid.columns = columns

      # Determine the left offset of children
      child_offset = @grid.padding_left

      grid_width = (columns * col_width) - grid_state.gutter[0]
      switch grid_state.align
        when "center"
          child_offset += (container_inner_width - grid_width) / 2

        when "right"
          child_offset += (container_inner_width - grid_width)

      @grid.child_offset = child_offset


    # ----------------------------------------------
    # arrange
    #
    # Reclaculates the position of each element
    # and arranges them to those positions
    # ----------------------------------------------
    _arrange: ->
      console.time("arrange")
      @_clearStaggerQueue() if @stagger_queue.length

      positions = @_getPositions()

      state_style = @state.style
      init_style = @state.initStyle

      stagger_speed = @state.staggerSpeed
      stagger_init = @state.staggerInit
      stagger_queue = []

      # Animate the container to the appropriate height
      @$container.css height: @grid.height

      for child, i in @children
        $child = child.el
        initialize = !child.initialized
        
        # Get the x/y position of this child
        position = positions[i]

        if initialize
          # Assign initialization style
          init_position = $.extend({}, position, init_style)
          $child.css(init_position)
          child.initialized = true

        # Animate only if necessary
        $.extend(position, state_style)
        position_string = JSON.stringify(position)
        if position_string isnt child.position
          if initialize
            stagger_queue.push [$child, position]
          else
            @_move $child, position

          # Store the position string for checking
          child.position = position_string
      
      @_staggerMove(stagger_queue) if stagger_queue.length

      console.timeEnd("arrange")
      @


    # ----------------------------------------------
    # clearStaggerQueue:
    #
    # If items are being staggered and another
    # arrange is called then it will mess everything
    # up by not allowing the timeouts to complete.
    # To solve this, if another arrangement is
    # called before a stagger finishes then all the
    # staggered children get forced into position.
    # ----------------------------------------------
    _clearStaggerQueue: ->
      clearInterval(@stagger_interval)
      @stagger_interval = null

      stagger_queue = @stagger_queue
      state_class = @state.transitionsClass

      for child in stagger_queue
        if child
          $child = child[0]
          position = child[1]

          $child.addClass(state_class)
          @_move($child, position)

      @stagger_queue = []


    # ----------------------------------------------
    # staggerMove:
    #
    # Uses a delay to move a child into position.
    # Also useful for a 0 delay right after child
    # initialization to compensate for the removal
    # of CSS transitions.
    #
    # stagger_queue: An array containing the child
    #                elements and the positions they
    #                will be arranged to, e.g.:
    #       [[$child, position], [$child, position]]
    # ----------------------------------------------
    _staggerMove: (stagger_queue) ->
      state_class = @state.transitionsClass

      if @state.staggerInit
        i = 0
        @stagger_queue = stagger_queue
        @stagger_interval = setInterval =>
          child = stagger_queue[i]

          if child
            $child = child[0]
            position = child[1]

            $child.addClass(state_class)
            @_move($child, position)

            # Prevent rearrangement when clearing queue
            @stagger_queue[i] = null

            i++
          else
            clearInterval(@stagger_interval)
            @stagger_interval = null

        , @state.staggerSpeed
      else
        for child in stagger_queue
          $child = child[0]
          position = child[1]

          @_staggerTimeout($child, position, state_class)


    # ----------------------------------------------
    # staggerTimeout:
    #
    # A special use case for when initializing items
    # that aren't supossed to be staggered. They
    # have to be put through a setTimeout of time 0
    # because it allows for the initialization style
    # to be fully added before arranging to the
    # state style.
    #
    # $child:        The element to be moved
    # position:      The hash of CSS attributes
    # state_class:   The class of the current state
    # ----------------------------------------------
    _staggerTimeout: ($child, position, state_class) ->
      setTimeout =>
        $child.addClass(state_class)
        @_move($child, position)
      , 0

    # ----------------------------------------------
    # move:
    #
    # Move a single child to a position
    #
    # $child:      The element to be moved
    # position:    The hash of CSS attributes
    # ----------------------------------------------
    _move: ($child, position) ->
      $child.css(position)


    # ----------------------------------------------
    # getPositions:
    #
    # Iterate over all of the children and
    # calculate/save their x/y positions
    # ----------------------------------------------
    _getPositions: ->
      col_width = @grid.col_width
      gutter_y = @state.grid.gutter[1]
      padding_top = @grid.padding_top

      # Array that stores the height of each column
      col_heights = []
      col_heights.push padding_top for i in [0...@grid.columns]

      # Go over each child and determine its position
      positions = []
      offset_left = @grid.child_offset
      for child, i in @children
        col = @lowestCol col_heights

        positions.push
          left: (col * col_width) + offset_left, 
          top: col_heights[col]

        col_heights[col] += child.height + gutter_y

      # Store the height of the grid
      @grid.height = @highestCol(col_heights) - gutter_y - padding_top

      return positions


    # ----------------------------------------------
    # lowestCol:
    #
    # Return the index position of the lowest
    # number from within a given array
    #
    # array: The array to process
    # ----------------------------------------------
    lowestCol: (array) ->
      $.inArray Math.min.apply(window,array), array


    # ----------------------------------------------
    # highestCol:
    #
    # Return the index position of the highest
    # number from within a given array
    #
    # array: The array to process
    # ----------------------------------------------
    highestCol: (array) ->
      array[$.inArray Math.max.apply(window,array), array]


    # ----------------------------------------------------------------------
    # ----------------------------- Features -------------------------------
    # ----------------------------------------------------------------------

    # ----------------------------------------------
    # enableResize:
    #
    # Arrange the grid upon resizing the window
    # ----------------------------------------------
    enableResize: ->
      speed = @options.resizeRate
      resizing = false

      $(window).on "resize", =>
        unless resizing
          resizing = true

          setTimeout =>
            @_calculateGrid()
            @_arrange()
          , speed * .6

          setTimeout =>
            @_calculateGrid()
            @_arrange()
            resizing = false
          , speed * 1.1

  # ----------------------------------------------------------------------
  # ------------------------ Dirty Initialization ------------------------
  # ----------------------------------------------------------------------
  $.fn[pluginName] = (options) ->
    args = arguments
    scoped_name = "plugin_" + pluginName
    
    if options is `undefined` or typeof options is "object"
      # Initialization
      @each ->
        unless $.data(@, scoped_name)
          $.data @, scoped_name, new Plugin(@, options)

    else if typeof options is "string" and options[0] isnt "_" and options isnt "init"
      # Calling public methods
      returns = undefined
      @each ->
        instance = $.data(@, scoped_name)

        if instance instanceof Plugin and typeof instance[options] is "function"
          returns = instance[options].apply(instance, Array::slice.call(args, 1))

        $.data @, scoped_name, null  if options is "destroy"
      (if returns isnt `undefined` then returns else @)
) jQuery, window, document