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
    state: 'default'
    states:
      default:
        class: 'default'

        grid:
          columns: null
          itemWidth: 30
          gutterX: 10
          gutterY: 10
          paddingY: 30
          paddingX: 30

        init:
          class: 'init'
          stagger: 10

      secondary:
        grid:
          columns: null
          itemWidth: 40
          gutterX: 10
          gutterY: 10
          paddingY: 20
          paddingX: 20

    responsive:
      refreshRate: 100

    resize:
      refreshRate: 10
      snapTo: [[30,50],[70,110],[110,170],[150,230]]
      increment: [60,60]
      minHeight: 40
      minWidth: 40

  Plugin = (element, options) ->
    @options = $.extend({}, defaults, options)
    @$container = $(element)
    @init()

    @ # Return this

  Plugin:: =
    init: ->
      @_createGlobals()
      @_initializeGrid()
      @_enableFeatures()
      @_parseChildren()
      @render()

    _createGlobals: ->
      @idCount = 0
      @children = []

      @state = @options.states[@options.state]

    _initializeGrid: ->
      @grid = $.extend({}, @state.grid)

      colWidth = @grid.itemWidth + @grid.gutterX
      @grid.colWidth = colWidth

      @grid.percentColWidth = false
      if typeof colWidth is "string" && colWidth.indexOf("%") >= 0
        @grid.percentColWidth = colWidth

      @_calculateGrid()

    _enableFeatures: ->
      @_enableResponsive()
      @_enableResizing()

    _parseChildren: ->
      $children = @$container.children()

      for child in $children
        @_parse(child)

    add: (child) ->
      @_parse(child)
      @render()

    insert: ($child) ->
      @$container.append($child)
      @add($child)

    insertMany: ($children) ->
      @$container.append($children)
      for child in $children
        @_parse(child)
      @render()

    _parse: (child) ->
      id = @idCount++
      $child = $(child)
      $child.attr('data-ss-id', id)
      width = $child.outerWidth() + @grid.gutterX

      @children.push
        id: id
        el: $child
        h: $child.outerHeight() + @grid.gutterY
        span: Math.round(width / @grid.colWidth)
        initialized: false

    _reparse: (id, width, height) ->
      child = @_getChildById(id)
      width ||= child.el.outerWidth()
      width += @grid.gutterX
      height ||= child.el.outerHeight()
      child.h = height + @grid.gutterY
      child.span = Math.ceil(width / @grid.colWidth)

    _getChildById: (id) ->
      return @children.filter((child) -> return child.id == id )[0]

    render: ->
      @_calculateGrid()
      @_pack()
      @_arrange()

    _calculateGrid: ->
      if @grid.percentColWidth
        @grid.colWidth = Math.floor @$container.width() * (parseInt(@grid.percentColWidth) * .01)

      unless @state.grid.columns >= 1
        width = @$container.width() + @grid.gutterX - (@state.grid.paddingX * 2)
        @grid.columns = Math.floor(width / @grid.colWidth)

    _pack: ->
      maxHeight = 0
      colHeights = []
      colHeights.push @grid.paddingY for c in [0...@grid.columns]
      
      for child, i in @children
        span = child.span

        if span > 1
          position = @_fitMinArea(colHeights, span)
          col = position.col
          yPos = position.height
        else
          col = @_fitMinIndex(colHeights)
          yPos = colHeights[col]

        child.x = col * @grid.colWidth + @state.grid.paddingX
        child.y = yPos

        height = yPos + child.h
        
        for offset in [0...child.span]
          colHeights[col + offset] = height
          maxHeight = height if height > maxHeight

      @grid.maxHeight = maxHeight - @state.grid.gutterY + @state.grid.paddingY

    _fitMinIndex: (array) ->
      array.indexOf(Math.min.apply(null, array))

    _fitMinArea: (array, span) ->
      positions = array.length - span + 1
      areas = []
      maxHeights = []

      for offset in [0...positions]
        heights = array.slice(0).splice(offset, span)
        max = Math.max.apply(null, heights)

        area = max
        for h in heights
          area += max - h

        areas.push(area)
        maxHeights.push(max)

      col = @_fitMinIndex(areas)

      return {
        col: col
        height: maxHeights[col]
      }

    _arrange: ->
      staggerSpeed = @state.init.stagger
      stagger = 0
      
      @$container.height(@grid.maxHeight)
      
      for child, i in @children
        $child = child.el
        initialize = !child.initialized 

        if initialize
          $child.addClass @state.init.class
          child.initialized = true
          stagger += staggerSpeed

        @_move(child)
        @_delayedMove(child, stagger) if initialize


    _delayedMove: (child, speed = 0) ->
      setTimeout(=>
        child.initialized = true
        child.el.addClass(@state.class).removeClass(@state.init.class)
        @_move(child)
      , speed)

    _move: (child, init) ->
      child.el.css
        transform: 'translate('+child.x+'px, '+child.y+'px)'

    setState: (state_name) ->
      state = @options.states[state_name]

      if state
        @state = state
        @_initializeGrid()
        @render()
      else
        console.error("Shapeshift does not recognize the state '#{state_name}', are you sure it's defined?")

    _enableResponsive: ->
      resizing = false
      finalTimeout = null
      speed = @options.responsive.refreshRate

      $(window).on 'resize.ss-responsive', =>
        unless resizing
          resizing = true

          clearTimeout(finalTimeout)
          finalTimeout = setTimeout( =>
            @render()
          , speed * 2)

          setTimeout( ->
            resizing = false
          , speed)

          @render()

    _enableResizing: ->
      mousedown = resizing = false
      startH = startW = startX = startY = $el = id = null
      minWidth = @options.resize.minWidth
      minHeight = @options.resize.minHeight
      speed = @options.resize.refreshRate
      snapIncrements = @options.resize.snapTo
      
      if snapIncrements is null
        xIncrement = @options.resize.increment[0]
        yIncrement = @options.resize.increment[1]

      @$container.on "mousedown.ss-resize", ".resizeToggle", (e) ->
        $el = $(this).closest("*[data-ss-id]")
        id = parseInt($el.attr('data-ss-id'))

        mousedown = true
        startH = $el.height()
        startW = $el.outerWidth()
        startX = e.pageX
        startY = e.pageY

      $(window).on "mousemove.ss-resize mouseup.ss-resize", (e) =>
        if mousedown
          if e.type is "mousemove" && !resizing
            resizing = true

            if snapIncrements is null
              newHeight = e.pageY - startY
              newWidth = e.pageX - startX

              newWidth = startW + (Math.ceil(newWidth / xIncrement) * xIncrement)
              newWidth = minWidth if newWidth <= minWidth
              newHeight = startH + (Math.ceil(newHeight / yIncrement) * yIncrement)
              newHeight = newHeight if newHeight <= minHeight
            else
              newHeight = startH + e.pageY - startY
              newWidth = startW + e.pageX - startX

              closest = 0
              minDistance = 9999999
              for increment, i in snapIncrements
                if increment[0] <= newWidth || increment[1] <= newHeight
                  closest = i

              newWidth = snapIncrements[closest][0]
              newHeight = snapIncrements[closest][1]
              console.log(newHeight)

            $el.css({ width: newWidth })
            $el.css({ height: newHeight })

            @_reparse(id, newWidth, newHeight)
            @render()

            setTimeout( ->
              resizing = false
            , speed)

          if e.type is "mouseup"
            mousedown = false
            startH = startW = startX = startY = $el = id = null

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
      @render()
      
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