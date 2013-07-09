#  Project: jQuery.Shapeshift
#  Description: Align elements to a column grid with drag and drop.
#  Author: Scott Elwood
#  Maintained By: We the Media, inc.
#  License: MIT

(($, window, document, undefined_) ->
  pluginName = "shapeshift"

  defaults = 
    # Grid Properties
    align: "center"
    columns: null
    colWidth: null
    gutterX: 10
    gutterY: 10

  Plugin = (element, options) ->
    @options = $.extend({}, defaults, options)
    @grid = {}

    @$container = $(element)
    @children = []

    @init()

  Plugin:: =
    init: ->
      @_parseAllChildren()
      @_initializeGrid()
      @_arrange()


    # --------------------------------------------------------------------
    # -------------------------- Public Methods --------------------------
    # --------------------------------------------------------------------

    # --------------------------------------------
    # insert
    #
    # Insert a new child into the container
    #
    # $child: The element to be inserted 
    #      i: The position to be inserted into
    # --------------------------------------------
    insert: ($child, i) ->
      # Append to the end by default
      i = @children.length if i is undefined

      @$container.append($child)
      @_addChild($child, i)
      @_calculateGrid()
      @_arrange()


    # --------------------------------------------------------------------
    # ------------------------- Private Methods --------------------------
    # --------------------------------------------------------------------

    # --------------------------------------------
    # parseAllChildren
    #
    # Go over every child element in the container
    # and add it to the global children array
    # --------------------------------------------
    _parseAllChildren: ->
      $children = @$container.children()
      child_count = $children.length

      for i in [0...child_count]
        $child = $($children[i])
        @_addChild($child, i)

      @


    # --------------------------------------------
    # addChild
    #
    # Add a single childs properties to a specific
    # index position in the children array
    #
    # $child: The element to be inserted 
    #      i: The position to be inserted into
    # --------------------------------------------
    _addChild: ($child, i) ->
      @children.splice i, 0,
        el: $child
        colspan: parseInt($child.attr("data-ss-colspan")) || 1
        height: $child.outerHeight()


    # --------------------------------------------
    # initializeGrid
    #
    # Determines the initial grid properties
    # --------------------------------------------
    _initializeGrid: ->
      gutter_x = @options.gutterX

      if @options.colWidth
        # Column width is manually set
        @grid.col_width = @options.colWidth + gutter_x
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


    # --------------------------------------------
    # calculateGrid:
    #
    # Some properties of the grid have to be
    # calculated dynamically, such as when the
    # container is resized.
    # --------------------------------------------
    _calculateGrid: ->
      col_width = @grid.col_width

      # Determine how many columns can exist
      container_inner_width = @$container.width()
      columns = @options.columns || Math.floor container_inner_width / col_width

      # The columns cannot outnumber the children
      if columns > @children.length
        columns = @children.length

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


    # --------------------------------------------
    # arrange
    #
    # Physically moves the elements to
    # predetermined positions
    # --------------------------------------------
    _arrange: ->
      children = @children
      child_count = children.length

      positions = @_getPositions()

      for i in [0...child_count]
        $child = children[i].el
        position = positions[i]

        console.log(position)
        $child.css(position)
        
      @


    # --------------------------------------------
    # getPositions:
    #
    # Iterate over all of the children and
    # calculate/save their x/y positions
    # --------------------------------------------
    _getPositions: ->
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
      total_children = @children.length
      offset_left = @grid.child_offset
      for i in [0...total_children]
        child = @children[i]
        col = @lowestCol(col_heights)

        left = (col * col_width) + offset_left
        top = col_heights[col]

        positions.push { 
          left: left, 
          top: top
        }

        col_heights[col] += child.height + gutter_y

      # Store the height of the grid
      @grid.height = @highestCol(col_heights) - gutter_y - padding_top

      return positions


    # --------------------------------------------
    # lowestCol:
    #
    # Return the index position of the lowest
    # number from within a given array
    # --------------------------------------------
    lowestCol: (array) ->
      $.inArray Math.min.apply(window,array), array


    # --------------------------------------------
    # highestCol:
    #
    # Return the index position of the highest
    # number from within a given array
    # --------------------------------------------
    highestCol: (array) ->
      array[$.inArray Math.max.apply(window,array), array]


  # --------------------------------------------------------------------
  # ----------------------- Dirty Initialization -----------------------
  # --------------------------------------------------------------------
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