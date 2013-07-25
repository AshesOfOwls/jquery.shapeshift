# ----------------------------------------------------------------------
#  Project: jQuery.Shapeshift
#  Description: Align elements to a column grid with drag and drop.
#  Author: Scott Elwood
#  Maintained By: We the Media, inc.
#  License: MIT
#
#  Version: 3.0
# ----------------------------------------------------------------------

(($, window, document, undefined_) ->
  pluginName = "shapeshift"

  defaults = 
    # Features
    enableResize: true
    resizeRate: 300
    cssAnimations: true

    # States
    state: 'default'
    states:
      default:
        animated: false
        animateSpeed: 100

        staggerInit: true
        staggerSpeed: 50

        grid:
          align: 'center'
          columns: null
          colWidth: 200
          gutter: ["auto", 10]
          padding: [0, 0]

        class: 'default'
        initClass: 'init'

      secondary:
        animated: true
        animateSpeed: 100

        grid:
          align: 'center'
          columns: null
          colWidth: null
          gutter: [10, 10]
          padding: [50, 50]

        class: 'secondary'
        initClass: 'init'

  Plugin = (element, options) ->
    @options = $.extend({}, defaults, options)
    @grid = {}
    @grid.percent_cols = false

    @$container = $(element)
    @children = []

    @stagger_queue = []
    @stagger_interval = null

    @state = @options.states[@options.state]

    @init()

  Plugin:: =
    init: ->
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
        cssAnimations = @options.cssAnimations
        old_state_class = @state.class
        new_state_class = state.class

        for child in @children
          if cssAnimations
            child.el.removeClass(old_state_class).addClass(new_state_class)
          else
            child.el.switchClass(old_state_class, new_state_class, @options.animateSpeed)

        @state = state
        @_initializeGrid()
        @_arrange()
      else
        console.error("Shapeshift does not recognize the state '#{state_name}', are you sure it's defined?")


    # ----------------------------------------------
    # shuffle:
    # Randomize the position of each item
    # https://gist.github.com/ddgromit/859699
    # ----------------------------------------------
    shuffle: ->
      a = @children

      i = a.length
      while --i > 0
          j = ~~(Math.random() * (i + 1))
          t = a[j]
          a[j] = a[i]
          a[i] = t

      @children = a
      @_arrange()


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
      col_width = @state.grid.colWidth
      @grid.percent_cols = false

      if col_width is null
        # Automatically generate a column width
        first_child_width = @children[0].el.outerWidth()
        col_width = first_child_width
      else if typeof col_width is 'string'
        # Percentage column width
        @grid.percent_cols = col_width

      @grid.col_width = col_width

      @_calculateGrid()


    # ----------------------------------------------
    # calculateGrid:
    #
    # Some properties of the grid have to be
    # calculated dynamically, such as when the
    # container is resized.
    # ----------------------------------------------
    _calculateGrid: ->
      container_width = @$container.innerWidth() - (@state.grid.padding[0] * 2)
      col_width = @state.grid.colWidth
      gutter_x = @state.grid.gutter[0]

      if @grid.percent_cols
        # TODO: Make sure to document the overflow: scroll on body
        col_width = Math.floor container_width * (parseInt(col_width) * .01)
      else
        col_width = @grid.col_width

      if gutter_x is 'auto'
        columns = Math.floor container_width / col_width
        if columns > 1
          remainder = container_width - (columns * col_width)
          gutter_x = Math.floor remainder / (columns - 1)
        else
          gutter_x = 0
      else if typeof gutter_x is 'string'
        gutter_x = Math.floor container_width * (parseInt(gutter_x) * .01)
        columns = Math.floor (container_width + gutter_x) / (col_width + gutter_x)

      @grid.columns = columns

      @grid.col_width = col_width
      @grid.gutter_x = gutter_x
      @grid.padding_x = 0
      @grid.padding_y = 0
      @grid.child_offset = @state.grid.padding[0]


    # ----------------------------------------------
    # arrange
    #
    # Reclaculates the position of each element
    # and arranges them to those positions
    # ----------------------------------------------
    _arrange: ->
      @_clearStaggerQueue() if @stagger_queue.length

      positions = @_getPositions()

      init_class = @state.initClass
      normal_class = @state.class

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
          $child.addClass(init_class)
          child.initialized = true

        # Animate only if necessary
        position_string = JSON.stringify(position)
        if position_string isnt child.position
          if initialize
            stagger_queue.push [$child, position]
          else
            @_move $child, position

          # Store the position string for checking
          child.position = position_string
      
      @_staggerMove(stagger_queue) if stagger_queue.length

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

      for child in stagger_queue
        if child
          $child = child[0]
          position = child[1]

          @_move($child, position, true)

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
      if @state.staggerInit
        i = 0
        @stagger_queue = stagger_queue
        @stagger_interval = setInterval =>
          child = stagger_queue[i]

          if child
            $child = child[0]
            position = child[1]

            @_move($child, position, true)

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

          @_staggerTimeout($child, position)


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
    # ----------------------------------------------
    _staggerTimeout: ($child, position) ->
      setTimeout =>
        @_move($child, position, true)
      , 0

    # ----------------------------------------------
    # move:
    #
    # Move a single child to a position
    #
    # $child:      The element to be moved
    # position:    The hash of CSS attributes
    # ----------------------------------------------
    _move: ($child, position, initialize_state = false) ->
      css_animations = @options.cssAnimations

      if css_animations
        $child.css(position)
      else
        animate_speed = @options.animateSpeed
        $child.stop(true, false).animate(position, animate_speed)

      if initialize_state
        setTimeout =>
          if css_animations
            # CSS Transitions
            $child.addClass(@state.class).removeClass(@state.initClass)
          else
            # jQuery Transitions
            $child.switchClass(@state.initClass, @state.class, animate_speed)
        , 0


    # ----------------------------------------------
    # getPositions:
    #
    # Iterate over all of the children and
    # calculate/save their x/y positions
    # ----------------------------------------------
    _getPositions: ->
      col_width = @grid.col_width + @grid.gutter_x
      gutter_y = @state.grid.gutter[1]
      padding_y = @grid.padding_y

      # Array that stores the height of each column
      col_heights = []
      col_heights.push padding_y for i in [0...@grid.columns]

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
      @grid.height = @highestCol(col_heights) - gutter_y + padding_y

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