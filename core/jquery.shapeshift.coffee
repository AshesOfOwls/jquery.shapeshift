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
          sort: { x: "left", y: "top" }
          gutter: { x: 10, y: 10 }
          padding: { x: 20, y: 20 }

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
      @_addChildren()
      @_calculateGrid()
      @_toggleFeatures()

      @render()
      @loaded = true

    _createGlobals: ->
      @idCount = 1
      @children = []
      @state = @grid = null


    # ----------------
    # Public Functions
    # ----------------

    # A full render of the grid
    #
    render: ->
      @_pack()
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

    # Adds all of the children in the current container to the app
    #
    _addChildren: ->
      $children = @$container.children()
      @_addChild(child) for child in $children

    # Sets the initial properties of the new child
    #
    _addChild: (child) ->
      id = @idCount++
      $child = $(child)

      $child.attr 'data-ssid', id
      # $child.html(id)

      @children.push
        id: id
        el: $child
        x: 0
        y: 0
        dragging: false

      @_parseChild(id)

    # Iterates over all of the children and moves them to their
    # physical position
    #
    _arrange: ->
      @$container.height(@maxHeight)
      
      for child in @children
        unless child.dragging
          $child = child.el
          $child.addClass @state.class # TODO: Is this necessary?
          @_move(child)

    # Calculates the properties of the grid according to the
    # options set by the current state.
    #
    _calculateGrid: ->
      col_width = @grid.colWidth
      width = @$container.width()
      inner_width = width - (@grid.padding.x * 2)

      columns = @state.grid.columns || Math.floor((inner_width + @grid.gutter.x) / col_width)
      if columns > @children.length
        child_span = 0
        child_span += child.span for child in @children
        columns = child_span if columns > child_span
        
      @grid.columns = columns
      @grid.innerWidth = inner_width
      @grid.width = width

      if @grid.align is "center"
        @grid.whiteSpace = (@grid.gutter.x / 2) + (inner_width - (columns * col_width)) / 2

    # Moves a child to a different position in the @children array
    # @note see: http://stackoverflow.com/questions/5839134
    #
    # @param [Integer] id the id of the child to move
    # @param [Integer] index the index position to move to
    #
    _changePosition: (id, index) ->
      child = @_getChildById id
      prev_index = @children.indexOf child
      new_index = index
      @children.splice(new_index, 0, @children.splice(prev_index, 1)[0])

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
        max = Math.max.apply(null, heights)

        area = max
        for h in heights
          area += max - h

        areas.push(area)
        max_heights.push(max)

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
        transform: 'translate('+child.x+'px, '+child.y+'px)'

    # Iterates over all of the children and determines their
    # coordinates in the grid.
    #
    _pack: (return_children) ->
      children = if return_children then @children.slice(0) else @children

      maxHeight = 0
      padding_y = @grid.padding.y
      padding_x = @grid.padding.x
      gutter_y = @grid.gutter.y
      col_width = @grid.colWidth
      columns = @grid.columns

      colHeights = []
      colHeights.push padding_y for c in [0...columns]
      
      for child in children
        unless (return_children and child.dragging)
          span = child.span
          span = columns if span > columns

          if span > 1
            position = @_fitMinArea(colHeights, span)
            col = position.col
            y = position.height
          else
            col = @_fitMinIndex(colHeights)
            y = colHeights[col]

          x = padding_x + (col * col_width)
          height = y + child.h + gutter_y

          # Custom alignment / sorting
          x += @grid.whiteSpace if @grid.align is "center"
          x = @grid.width - x - child.w if @grid.sort.x is "right"

          child.x = x
          child.y = y

          for offset in [0...span]
            colHeights[col + offset] = height
            maxHeight = height if height > maxHeight

      return children if return_children

      @maxHeight = @state.grid.maxHeight || maxHeight - gutter_y + padding_y

      if @grid.sort.y is "bottom"
        for child in @children
          child.y = @maxHeight - child.y - child.h

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

    # Toggles whether a child is active, such as when dragging 
    # or resizing
    #
    # @param [Integer] id the id of the child
    # @param [Boolean] active true if the child is active
    _toggleActive: (id, active) ->
      child = @_getChildById(id)

      if active 
        child.el.addClass("no-transitions").css
          zIndex: @idCount + 1
      else
        child.el.removeClass("no-transitions").css
          zIndex: child.id

    # Toggles extra features on and off
    #
    _toggleFeatures: ->
      @_toggleDraggable()
      @_toggleResizing()
      @_toggleResponsive()

    # Creates or destroys the ability to have the children be draggable.
    #
    # @param [Boolean] enabled True to enable dragging of children
    #
    _toggleDraggable: (enabled) ->
      @drag = { child: null }
      if @state.draggable.enabled && enabled isnt false
        for child in @children
          child.el.draggable
            start: (e, ui) =>
              return false if $(e.originalEvent.target).is @state.resize.handle

              $child = ui.helper
              id = parseInt $child.attr "data-ssid"
              @drag.child = @_getChildById id
              @drag.child.dragging = true

              @_toggleActive id, true
              @drag.child.el.css transform: "none"
            drag: (e, ui) =>
              x = e.pageX + @$container.offset().left
              y = e.pageY + @$container.offset().top
              min_distance = 999999
              spot = null

              for child, i in @children
                dx = x - child.x
                dy = y - child.y
                distance = Math.sqrt(dx * dx + dy * dy)

                if distance < min_distance
                  min_distance = distance
                  spot = i

              console.log @children[spot].dragging
              if spot isnt null and @children[spot].dragging isnt true
                @_changePosition @drag.child.id, spot
                @render()
            stop: (e, ui) =>
              child = @drag.child
              child.dragging = false
              child.el.css { left: 0, top: 0 }

              @_toggleActive child.id, false

    # Creates or destroys the ability to have the children resize
    # when their handle is clicked on.
    #
    # @param [Boolean] enabled True to enable resizing of children
    #
    _toggleResizing: (enabled) ->
      if @state.resize.enabled && enabled isnt false
        self = @
        options = @state.resize

        start = {}
        $el = id = null
        mousedown = resizing = false
        min_width = options.min.w
        min_height = options.min.h
        refresh_rate = options.refreshRate
        snap_sizes = options.sizes
        has_snap_sizes = $.isArray(snap_sizes)
        increment_x = @state.resize.increment.x
        increment_y = @state.resize.increment.y
        increment_sizes = increment_x > 1 or increment_y > 1
        render_on_move = options.renderOn is "mousemove"

        @$container.off('.ss-resize').on "mousedown.ss-resize", options.handle, (e) ->
          $el = $(this).closest("*[data-ssid]")
          id = parseInt($el.attr('data-ssid'))

          mousedown = true
          start =
            h: $el.height()
            w: $el.outerWidth()
            x: e.pageX
            y: e.pageY

          self._toggleActive(id, true)

        $(window).off('.ss-resize').on "mousemove.ss-resize mouseup.ss-resize", (e) =>
          if mousedown
            if e.type is "mousemove" && !resizing
              resize(e)
              
              setTimeout( =>
                resizing = false
              , refresh_rate)

            if e.type is "mouseup"
              @_toggleActive(id, false)
              resize(e)
              @render() unless render_on_move
              mousedown = resizing = false
              start = {}

        resize = (e) =>
          resizing = true

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

          $el.css
            width: new_width
            height: new_height

          @_parseChild(id)
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