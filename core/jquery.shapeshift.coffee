#  Project: jQuery.Shapeshift
#  Description: Align elements to a column grid with drag and drop.
#  Author: Scott Elwood
#  Maintained By: We the Media, inc.
#  License: MIT
#
#  Version: 3.0

(($, window, document, undefined_) ->
  pluginName = "shapeshift"

  defaults =
    state: null
    states:
      default:
        class: 'default'

        grid:
          columns: null
          itemWidth: 30
          maxHeight: null

          align: "center"
          origin: "nw"
          gutter: { x: 10, y: 10 }
          padding: { x: 0, y: 0 }

        responsive:
          enabled: true
          refreshRate: 50

        resize:
          handle: ".resizeToggle"
          enabled: true
          refreshRate: 50
          sizes: null # [[30,30],[70,110],[110,170],[150,230]]
          increment: { x: 40, y: 1 }
          min: { h: 40, w: 30 }
          renderOn: "mouseup"

        draggable:
          enabled: true

        extras:
          indexDisplay: "span"

  Plugin = (element, options) ->
    @options = $.extend({}, defaults, options)
    @$container = $(element)
    @init()

    @ # Return this!

  Plugin:: =
    init: ->
      @loaded = false
      @_createGlobals()
      @_setState()
      @addChildren()
      @_calculateGrid()
      @_toggleFeatures()
      @_setIndexes()

      @render()
      @loaded = true

    _createGlobals: ->
      @idCount = 1
      @children = []
      @state = @grid = null


    # ----------------
    # Public Functions
    # ----------------

    # Takes an array of jQuery elements and adds them to shapeshift.
    #
    # @param [Array] children array of jQuery objects for the children
    #
    addChildren: ($children) ->
      $children ||= @$container.children()
      @addChild(child) for child in $children

    # Sets the initial properties of the new child and adds 
    # them to the collection.
    #
    # @param [Object] child jQuery object of the child element
    #
    addChild: (child) ->
      $child = $(child)
      currentId = parseInt $child.attr("data-ssid")

      if isNaN currentId
        id = @idCount++

        $child.attr 'data-ssid', id

        @children.push
          id: id
          index: @children.length
          el: $child
          x: 0
          y: 0
          initialized: false
          state: null

        @_parseChild(id)

    # A full render of the grid
    #
    render: ->
      positions = @_pack()
      @children = $.extend(true, @children, positions)
      @_arrange()
    
    # Reverses the children
    #
    reverse: ->
      @children.reverse()
      @render()
      @children

    # Randomly shuffles the children
    # @note see: https://gist.github.com/ddgromit/859699
    #
    shuffle: ->
      a = @children

      i = a.length
      while --i > 0
          j = ~~(Math.random() * (i + 1))
          t = a[j]
          a[j] = a[i]
          a[i] = t

      @children = a
      @render()
      @children


    # -----------------
    # Private Functions
    # -----------------

    # Iterates over all of the children and moves them to their
    # physical position
    #
    _arrange: ->
      @$container.height(@maxHeight)
      
      for child in @children
        @_move(child) if child.state is null

    # Calculates the properties of the grid according to the
    # options set by the current state.
    #
    _calculateGrid: ->
      col_width = @grid.colWidth
      gutter_x = @grid.gutter.x
      padding_x = @grid.padding.x
      width = @$container.width()

      inner_width = width - (padding_x * 2)
      columns = @state.grid.columns || Math.floor((inner_width + gutter_x) / col_width)
      
      # If there are more columns than children, determine if
      # their cumulative span is more than the column count.
      # If not, set the column count to the span cumulation.
      if columns > @children.length
        child_span = 0
        child_span += child.span for child in @children
        columns = child_span if columns > child_span
        
      @grid.columns = columns
      @grid.innerWidth = inner_width
      @grid.width = width

      @grid.whiteSpace = inner_width - (columns * col_width) + gutter_x

    # Moves a child to a different position in the @children array
    # @note see: http://stackoverflow.com/questions/5839134
    # TODO: Probably needs refactoring
    #
    # @param [Integer] id the id of the child to move
    # @param [Integer] index the index position to move
    #
    _changePosition: (id, index) ->
      child = @_getChildById id
      prev_index = @children.indexOf child
      new_index = index
      @children.splice(new_index, 0, @children.splice(prev_index, 1)[0])

      # Set the new index positions for all of the children,
      # starting with the lowest index position changes
      lowest_index = if new_index < prev_index then new_index else prev_index
      @_setIndexes(lowest_index)

    # Iterates over all the feasible locations for the child and creates
    # an array containing the amount of unused area if the child was positioned
    # there. It then chooses the column with the lowest unused area.
    #
    # @param [Array] array the array of column heights
    # @param [Integer] span the column span of the child
    #
    _fitMinArea: (array, span) ->
      columns = array.length
      positions = array.length - span + 1
      areas = []
      max_heights = []

      for offset in [0...positions]
        heights = array.slice(0).splice(offset, span)
        tallest = Math.max.apply(null, heights)

        area = tallest
        for h in heights
          area += tallest - h

        areas.push(area)
        max_heights.push(tallest)

      col = @_fitMinIndex(areas)

      return {
        col: col
        height: max_heights[col]
      }

    # Finds the index of the lowest, left most column in the array.
    #
    # @param [array] array the array of column heights
    #
    _fitMinIndex: (array) ->
      array.indexOf(Math.min.apply(null, array))

    # Returns the child object with the corresponding id
    #
    # @param [Integer] id the child id
    #
    _getChildById: (id) ->
      return @children.filter((child) -> return child.id == id )[0]

    # Moves a child to its determined position
    #
    # @param [Object] child the child to move
    #
    _move: (child) ->
      child.el.css
        transform: "translate(#{child.x}px, #{child.y}px)"

      unless child.initialized
        setTimeout =>
          child.initialized = true
          child.el.addClass(@state.class)
        , 0

    # Iterates over all of the children and determines their
    # coordinates in the grid.
    #
    _pack: (include_stateful = true) ->
      children = @children

      columns = @grid.columns
      col_width = @grid.colWidth
      gutter_y = @grid.gutter.y
      padding_y = @grid.padding.y
      padding_x = @grid.padding.x
      maxHeight = 0

      # Stores the height value for each column
      colHeights = []
      colHeights.push padding_y for c in [0...columns]

      positions = []
      
      for child in children
        if include_stateful or child.state is null
          span = child.span
          span = columns if span > columns

          if span > 1
            # If the span is only one, then we just need to
            # find the column with the lowest height
            position = @_fitMinArea(colHeights, span)
            col = position.col
            y = position.height
          else
            # If the span is greater than one, we have to find 
            # the position that the child can be placed which will 
            # leave the least amount of unused space below it.
            col = @_fitMinIndex(colHeights)
            y = colHeights[col]

          # We can calculate the physical position
          # based on the column data
          x = padding_x + (col * col_width)
          height = y + child.h + gutter_y

          # Set the position data on the child object
          positions.push
            x: x
            y: y

          # Adjust the column heights to fit the child
          for offset in [0...span]
            colHeights[col + offset] = height
            maxHeight = height if height > maxHeight

      # Set the max height for the container height
      @maxHeight = @state.grid.maxHeight || maxHeight - gutter_y + padding_y


      # Sort based on grid settings
      align = @grid.align
      origin = @grid.origin
      origin_is_bottom = origin[0] is "s"
      origin_is_right = origin[1] is "e"

      if align is "left"
        if origin_is_right
          p.x += @grid.whiteSpace for p in positions
      else if align is "center"
        p.x += @grid.whiteSpace / 2 for p in positions
      else if align is "right"
        unless origin_is_right
          p.x += @grid.whiteSpace for p in positions

      if origin_is_bottom
        for child, i in children
          positions[i].y = @maxHeight - positions[i].y - child.h

      if origin_is_right
        for p, i in positions
          p.x = @grid.innerWidth - @children[i].w - p.x

      return positions

    # Calculates the dynamic properties of the child
    #
    # @param [Integer] id the child id
    #
    _parseChild: (id) ->
      child = @_getChildById(id)

      col_width = @grid.colWidth
      gutter_x = @grid.gutter.x

      span = Math.ceil((child.el.outerWidth() + gutter_x) / col_width)
      width = (span * col_width) - gutter_x

      child.h = child.el.outerHeight()
      child.w = width
      child.span = span

    _setIndexes: (start = 0) ->
      indexDisplay = @state.extras.indexDisplay

      for i in [start...@children.length]
        child = @children[i]
        child.index = i

        if indexDisplay isnt null
          child.el.find(indexDisplay).html(i)


    # Sets the grid to match the current state
    #
    _setGrid: ->
      @grid = $.extend({}, @state.grid)
      @grid.colWidth = @grid.itemWidth + @grid.gutter.x

    # Changes to a different state defined in the properties.
    #
    # @param [String] name the name of the state
    #
    _setState: (name) ->
      @options.state = name || @options.state || "default"
      @state = @options.states[@options.state]

      @_setGrid()
      @_toggleFeatures() if @loaded

    # Toggles whether a child has a state, such as when dragging 
    # or resizing
    #
    # @param [Integer] id the id of the child
    # @param [Boolean] active true if the child is active
    #
    _toggleChildState: (id, enabled, state) ->
      child = @_getChildById(id)
      $child = child.el

      child.state = if state and enabled then state else null

      $child.toggleClass "no-transitions", enabled
      $child.css
        zIndex: if enabled then @idCount + 1 else child.id

    # Toggles extra features on and off
    # TODO: All the features need refactoring
    #
    _toggleFeatures: ->
      @_toggleDraggable()
      @_toggleResizing()
      @_toggleResponsive()

    _getChildByElement: ($child) ->
      id = parseInt $child.attr "data-ssid"
      return @_getChildById id


    # Creates or destroys the ability to have the children be draggable.
    #
    # @param [Boolean] enabled True to enable dragging of children
    #
    _toggleDraggable: (enabled) ->
      @drag = null

      if @state.draggable.enabled and enabled isnt false
        for child in @children
          child.el.draggable
            start: (e, ui) =>
              # Do not drag if resize handle is clicked
              return false if $(e.originalEvent.target).is @state.resize.handle

              # Determine the dragged child
              child = @_getChildByElement ui.helper
              $child = child.el

              # Set the child to be dragging
              @_toggleChildState child.id, true, "dragging"

              # Global properties needed
              @drag =
                child: child
                offsetX: -1 * (@$container.offset().left + @grid.padding.x)
                offsetY: -1 * (@$container.offset().top + @grid.padding.y)
                positions: [@_pack(false), @_pack(true)]

            drag: (e, ui) =>
              $child = @drag.child.el

              estimates = [{distance: 999999, spot: null},
                          {distance: 999999, spot: null}]

              grid_x = $child.offset().left + @drag.offsetX
              grid_y = $child.offset().top + @drag.offsetY

              for positions, i in @drag.positions
                # Iterate over the children and determine
                # which has the least distance to the cursor.
                for position, j in positions
                  dx = grid_x - position.x
                  dy = grid_y - position.y
                  distance = Math.sqrt(dx * dx + dy * dy)
                  if distance < estimates[i].distance
                    estimates[i].distance = distance
                    estimates[i].spot = j

              lowest_distance = 9999999
              selection = null
              for estimate, i in estimates
                if estimate.distance < lowest_distance
                  selection = estimate
                  lowest_distance = estimate.distance

              # If a spot is found, change the position of the child
              if selection isnt null
                @_changePosition @drag.child.id, selection.spot
                @render()

              # Manually set the jQuery ui drag position
              # so that we can use CSS3 translate
              $child.css
                transform: "translate(#{ui.position.left}px, #{ui.position.top}px)"

              ui.position.top = 0
              ui.position.left = 0

            stop: (e, ui) =>
              child = @drag.child
              $child = child.el

              x = $child.offset().left - @drag.offsetX
              y = $child.offset().top - @drag.offsetY

              @_toggleChildState child.id, false, "dragging"
              @render()

              @drag = null

    # Creates or destroys the ability to have the children resize
    # when their handle is clicked on.
    #
    # @param [Boolean] enabled True to enable resizing of children
    #
    _toggleResizing: (enabled) ->
      if @state.resize.enabled && enabled isnt false
        self = @
        options = @state.resize

        min_width = options.min.w
        min_height = options.min.h
        refresh_rate = options.refreshRate
        snap_sizes = options.sizes
        has_snap_sizes = $.isArray(snap_sizes)
        increment_x = @state.resize.increment.x
        increment_y = @state.resize.increment.y
        increment_sizes = increment_x > 1 or increment_y > 1
        render_on_move = options.renderOn is "mousemove"

        # --
        @resize =
          mousedown: false

        @$container.off('.ss-resize').on "mousedown.ss-resize", options.handle, (e) =>
          $el = $(e.target).closest("*[data-ssid]")
          child = @_getChildByElement $el

          @resize.child = child
          @resize.mousedown = true
          @resize.resizing = false
          @resize.start =
            h: $el.height()
            w: $el.outerWidth()
            x: e.pageX
            y: e.pageY

          @_toggleChildState child.id, true, "resizing"

        $(window).off('.ss-resize').on "mousemove.ss-resize mouseup.ss-resize", (e) =>
          if @resize.mousedown
            if e.type is "mousemove" && !@resize.resizing
              resize(e)
              
              setTimeout( =>
                @resize.resizing = false
              , refresh_rate)

            if e.type is "mouseup"
              resize(e)

              @resize.mousedown = false
              @_toggleChildState @resize.child.id, false
              @render() unless render_on_move

        resize = (e) =>
          @resize.resizing = true
          child = @resize.child
          start = @resize.start

          offset_y = e.pageY - start.y
          offset_x = e.pageX - start.x

          if has_snap_sizes
            new_height = start.h + offset_y
            new_width = start.w + offset_x

            closest = 0
            minDistance = 9999999
            for size, i in snap_sizes
              if size[0] <= new_width || size[1] <= new_height
                closest = i

            new_width = snap_sizes[closest][0]
            new_height = snap_sizes[closest][1]
          else if increment_sizes
            # Adjust to the next highest increment multiple
            new_width = start.w + Math.ceil(offset_x / increment_x) * increment_x
            new_height = start.h + Math.ceil(offset_y / increment_y) * increment_y

          # Can never go below min height/widths
          new_width = min_width if new_width < min_width
          new_height = min_height if new_height < min_height

          child.el.css
            width: new_width
            height: new_height

          @_parseChild(child.id)
          @render() if render_on_move
      else
        @$container.off '.ss-resize'
        $(window).off '.ss-resize'

    # Creates or destroys the ability to have the container rearrange
    # upon resize of the window.
    #
    # @param [Boolean] enabled True to enable repsonsiveness
    #
    _toggleResponsive: (enabled) ->
      if @state.responsive.enabled && enabled isnt false
        refresh_rate = @state.responsive.refreshRate
        resizing = false
        timeout = null

        $(window).off('.ss-responsive').on 'resize.ss-responsive', =>
          unless resizing
            resizing = true

            clearTimeout(timeout)
            timeout = setTimeout( =>
              @_calculateGrid()
              @render()
              resizing = false
            , refresh_rate)

      else
        $(window).off '.ss-responsive'

  # -----------------------------------
  # Initialization
  # Allows private and public functions
  # -----------------------------------
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