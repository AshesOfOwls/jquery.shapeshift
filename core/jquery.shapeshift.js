// JsCoffee converted with www.js2coffee.org
(function($, window, document, undefined_) {
  var Plugin, defaults, pluginName;
  pluginName = "shapeshift";
  defaults = {
    state: null,
    states: {
      "default": {
        "class": 'default',
        grid: {
          columns: null,
          itemWidth: 30,
          maxHeight: null,
          align: "center",
          origin: "nw",
          gutter: {
            x: 10,
            y: 10
          },
          padding: {
            x: 0,
            y: 0
          }
        },
        adjustable: {
          enabled: false,
          maxColWidth: 300
        },
        responsive: {
          enabled: true,
          refreshRate: 50
        },
        resize: {
          handle: ".resizeToggle",
          enabled: true,
          refreshRate: 50,
          sizes: null,
          increment: {
            x: 40,
            y: 1
          },
          min: {
            h: 40,
            w: 30
          },
          renderOn: "mouseup"
        },
        draggable: {
          enabled: true
        },
        extras: {
          indexDisplay: "span"
        }
      }
    }
  };
  Plugin = function(element, options) {
    this.options = options || {};
    this.$container = $(element);
    this.init();
    return this;
  };
  Plugin.prototype = {
    init: function() {
      this.loaded = false;
      this._createGlobals();
      this._setState();
      this.addChildren();
      this._calculateGrid();
      this._toggleFeatures();
      this._setIndexes();
      this.render();
      return this.loaded = true;
    },
    _createGlobals: function() {
      this.idCount = 1;
      this.children = [];
      return this.state = this.grid = null;
    },
    addChildren: function($children) {
      var child, _i, _len, _results;
      $children || ($children = this.$container.children());
      _results = [];
      for (_i = 0, _len = $children.length; _i < _len; _i++) {
        child = $children[_i];
        _results.push(this.addChild(child));
      }
      return _results;
    },
    addChild: function(child) {
      var $child, currentId, id;
      $child = $(child);
      currentId = parseInt($child.attr("data-ssid"));
      if (isNaN(currentId)) {
        id = this.idCount++;
        $child.attr('data-ssid', id);
        this.children.push({
          id: id,
          index: this.children.length,
          el: $child,
          x: 0,
          y: 0,
          initialized: false,
          state: null
        });
        return this._parseChild(id);
      }
    },
    render: function() {
      var positions;
      positions = this._pack();
      this.children = $.extend(true, this.children, positions);
      return this._arrange();
    },
    reverse: function() {
      this.children.reverse();
      this.render();
      return this.children;
    },
    shuffle: function() {
      var a, i, j, t;
      a = this.children;
      i = a.length;
      while (--i > 0) {
        j = ~~(Math.random() * (i + 1));
        t = a[j];
        a[j] = a[i];
        a[i] = t;
      }
      this.children = a;
      this.render();
      return this.children;
    },
    _arrange: function() {
      var child, _i, _len, _ref, _results;
      this.$container.height(this.maxHeight);
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child.state === null) {
          _results.push(this._move(child));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    _calculateGrid: function() {
      var child, child_span, col_width, columns, gutter_x, inner_width, padding_x, width, _i, _len, _ref;
      col_width = this.grid.colWidth;
      gutter_x = this.grid.gutter.x;
      padding_x = this.grid.padding.x;
      width = this.$container.width();
      inner_width = width - (padding_x * 2);
      columns = this.state.grid.columns || Math.floor((inner_width + gutter_x) / col_width);
      if (!this.state.grid.columns && this.state.responsive.enabled && !!this.grid.itemWidth) {
        columns = Math.floor((inner_width + gutter_x) / col_width);
      }
      if (!this.grid.itemWidth) {
        this.grid.align = "left";
        this.grid.colWidth = Math.round((inner_width - (gutter_x * columns)) / columns);
      }
      if (this.state.adjustable.enabled) {
        this.grid.align = "left";
        columns = Math.ceil(inner_width / this.state.adjustable.maxColWidth);
        this.grid.colWidth = Math.round((inner_width - (gutter_x * columns)) / columns);
        if (((this.grid.colWidth + gutter_x) * columns) > inner_width) {
          this.grid.colWidth = this.grid.colWidth - 1;
        }
      }
      if (columns > this.children.length) {
        child_span = 0;
        _ref = this.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          child_span += child.span;
        }
        if (columns > child_span) {
          columns = child_span;
        }
      }
      this.grid.columns = columns;
      this.grid.innerWidth = inner_width;
      this.grid.width = width;
      return this.grid.whiteSpace = inner_width - (columns * col_width) + gutter_x;
    },
    _changePosition: function(id, index) {
      var child, lowest_index, new_index, prev_index;
      child = this._getChildById(id);
      prev_index = this.children.indexOf(child);
      new_index = index;
      this.children.splice(new_index, 0, this.children.splice(prev_index, 1)[0]);
      lowest_index = new_index < prev_index ? new_index : prev_index;
      return this._setIndexes(lowest_index);
    },
    _fitMinArea: function(array, span) {
      var area, areas, col, columns, h, heights, max_heights, offset, positions, tallest, _i, _j, _len;
      columns = array.length;
      positions = array.length - span + 1;
      areas = [];
      max_heights = [];
      for (offset = _i = 0; 0 <= positions ? _i < positions : _i > positions; offset = 0 <= positions ? ++_i : --_i) {
        heights = array.slice(0).splice(offset, span);
        tallest = Math.max.apply(null, heights);
        area = tallest;
        for (_j = 0, _len = heights.length; _j < _len; _j++) {
          h = heights[_j];
          area += tallest - h;
        }
        areas.push(area);
        max_heights.push(tallest);
      }
      col = this._fitMinIndex(areas);
      return {
        col: col,
        height: max_heights[col]
      };
    },
    _fitMinIndex: function(array) {
      return array.indexOf(Math.min.apply(null, array));
    },
    _getChildById: function(id) {
      return this.children.filter(function(child) {
        return child.id === id;
      })[0];
    },
    _move: function(child) {
      var attributes;
      attributes = {
        transform: "translate(" + child.x + "px, " + child.y + "px)"
      };
      if (this.calculates_width) {
        $.extend(attributes, {
          width: child.w,
          height: child.h
        });
      }
      child.el.css(attributes);
      if (!child.initialized) {
        return setTimeout((function(_this) {
          return function() {
            child.initialized = true;
            return child.el.addClass(_this.state["class"]);
          };
        })(this), 0);
      }
    },
    _pack: function(include_stateful) {
      var align, attributes, c, child, child_height, child_width, children, col, colHeights, col_width, columns, gutter_x, gutter_y, height, i, maxHeight, offset, origin, origin_is_bottom, origin_is_right, p, padding_x, padding_y, position, positions, span, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _o, _p;
      if (include_stateful == null) {
        include_stateful = true;
      }
      children = this.children;
      columns = this.grid.columns;
      col_width = this.grid.colWidth;
      gutter_y = this.grid.gutter.y;
      gutter_x = this.grid.gutter.x;
      padding_y = this.grid.padding.y;
      padding_x = this.grid.padding.x;
      maxHeight = 0;
      colHeights = [];
      for (c = _i = 0; 0 <= columns ? _i < columns : _i > columns; c = 0 <= columns ? ++_i : --_i) {
        colHeights.push(padding_y);
      }
      positions = [];
      for (_j = 0, _len = children.length; _j < _len; _j++) {
        child = children[_j];
        if (include_stateful || child.state === null) {
          span = child.span;
          if (span > columns) {
            span = columns;
          }
          if (span > 1) {
            position = this._fitMinArea(colHeights, span);
            col = position.col;
            y = position.height;
          } else {
            col = this._fitMinIndex(colHeights);
            y = colHeights[col];
          }
          if (this.calculates_width) {
            x = padding_x + (col * (col_width + gutter_x));
            child_width = (col_width * span) + (span * gutter_x) - gutter_x;
            child_height = Math.floor((child.h / child.w) * child_width);
            height = y + child_height + gutter_y;
            attributes = {
              w: child_width,
              h: child_height
            };
          } else {
            x = padding_x + (col * col_width);
            height = y + child.h + gutter_y;
            attributes = {};
          }
          positions.push($.extend({
            x: x,
            y: y
          }, attributes));
          for (offset = _k = 0; 0 <= span ? _k < span : _k > span; offset = 0 <= span ? ++_k : --_k) {
            colHeights[col + offset] = height;
            if (height > maxHeight) {
              maxHeight = height;
            }
          }
        }
      }
      this.maxHeight = this.state.grid.maxHeight || maxHeight - gutter_y + padding_y;
      align = this.grid.align;
      origin = this.grid.origin;
      origin_is_bottom = origin[0] === "s";
      origin_is_right = origin[1] === "e";
      if (align === "left") {
        if (origin_is_right) {
          for (_l = 0, _len1 = positions.length; _l < _len1; _l++) {
            p = positions[_l];
            p.x += this.grid.whiteSpace;
          }
        }
      } else if (align === "center") {
        for (_m = 0, _len2 = positions.length; _m < _len2; _m++) {
          p = positions[_m];
          p.x += this.grid.whiteSpace / 2;
        }
      } else if (align === "right") {
        if (!origin_is_right) {
          for (_n = 0, _len3 = positions.length; _n < _len3; _n++) {
            p = positions[_n];
            p.x += this.grid.whiteSpace;
          }
        }
      }
      if (origin_is_bottom) {
        for (i = _o = 0, _len4 = children.length; _o < _len4; i = ++_o) {
          child = children[i];
          positions[i].y = this.maxHeight - positions[i].y - child.h;
        }
      }
      if (origin_is_right) {
        for (i = _p = 0, _len5 = positions.length; _p < _len5; i = ++_p) {
          p = positions[i];
          p.x = this.grid.innerWidth - this.children[i].w - p.x;
        }
      }
      return positions;
    },
    _parseChild: function(id) {
      var child, col_width, gutter_x, span, width;
      child = this._getChildById(id);
      if (this.calculates_width) {
        width = child.el.outerWidth();
        span = child.el.attr('data-ss-span') || 1;
      } else {
        col_width = this.grid.colWidth;
        gutter_x = this.grid.gutter.x;
        span = Math.ceil((child.el.outerWidth() + gutter_x) / col_width);
        width = (span * col_width) - gutter_x;
      }
      child.h = child.el.outerHeight();
      child.w = width;
      return child.span = span;
    },
    _setIndexes: function(start) {
      var child, i, indexDisplay, _i, _ref, _results;
      if (start == null) {
        start = 0;
      }
      indexDisplay = this.state.extras.indexDisplay;
      _results = [];
      for (i = _i = start, _ref = this.children.length; start <= _ref ? _i < _ref : _i > _ref; i = start <= _ref ? ++_i : --_i) {
        child = this.children[i];
        child.index = i;
        if (indexDisplay !== null) {
          _results.push(child.el.find(indexDisplay).html(i));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    _setGrid: function() {
      this.grid = $.extend({}, this.state.grid);
      return this.grid.colWidth = this.grid.itemWidth + this.grid.gutter.x;
    },
    _setState: function(name) {
      var state_default;
      state_default = defaults.states["default"];
      if (name || this.options.state) {
        this.options = $.extend(true, {}, state_default, this.options);
        this.state = this.options.states[name || this.options.state];
      } else {
        this.state = $.extend(true, {}, state_default, this.options);
      }
      this.calculates_width = !!(this.state.adjustable.enabled || (this.state.grid.columns && this.state.grid.itemWidth === null));
      this._setGrid();
      if (this.loaded) {
        return this._toggleFeatures();
      }
    },
    _toggleChildState: function(id, enabled, state) {
      var $child, child;
      child = this._getChildById(id);
      $child = child.el;
      child.state = state && enabled ? state : null;
      $child.toggleClass("no-transitions", enabled);
      return $child.css({
        zIndex: enabled ? this.idCount + 1 : child.id
      });
    },
    _toggleFeatures: function() {
      this._toggleDraggable();
      this._toggleResizing();
      return this._toggleResponsive();
    },
    _getChildByElement: function($child) {
      var id;
      id = parseInt($child.attr("data-ssid"));
      return this._getChildById(id);
    },
    _toggleDraggable: function(enabled) {
      var child, _i, _len, _ref, _results;
      this.drag = null;
      if (this.state.draggable.enabled && enabled !== false) {
        _ref = this.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.el.draggable({
            start: (function(_this) {
              return function(e, ui) {
                var $child;
                if ($(e.originalEvent.target).is(_this.state.resize.handle)) {
                  return false;
                }
                child = _this._getChildByElement(ui.helper);
                $child = child.el;
                _this._toggleChildState(child.id, true, "dragging");
                return _this.drag = {
                  child: child,
                  offsetX: -1 * (_this.$container.offset().left + _this.grid.padding.x),
                  offsetY: -1 * (_this.$container.offset().top + _this.grid.padding.y),
                  positions: [_this._pack(false), _this._pack(true)]
                };
              };
            })(this),
            drag: (function(_this) {
              return function(e, ui) {
                var $child, distance, dx, dy, estimate, estimates, grid_x, grid_y, i, j, lowest_distance, position, positions, selection, _j, _k, _l, _len1, _len2, _len3, _ref1;
                $child = _this.drag.child.el;
                estimates = [
                  {
                    distance: 999999,
                    spot: null
                  }, {
                    distance: 999999,
                    spot: null
                  }
                ];
                grid_x = $child.offset().left + _this.drag.offsetX;
                grid_y = $child.offset().top + _this.drag.offsetY;
                _ref1 = _this.drag.positions;
                for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
                  positions = _ref1[i];
                  for (j = _k = 0, _len2 = positions.length; _k < _len2; j = ++_k) {
                    position = positions[j];
                    dx = grid_x - position.x;
                    dy = grid_y - position.y;
                    distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < estimates[i].distance) {
                      estimates[i].distance = distance;
                      estimates[i].spot = j;
                    }
                  }
                }
                lowest_distance = 9999999;
                selection = null;
                for (i = _l = 0, _len3 = estimates.length; _l < _len3; i = ++_l) {
                  estimate = estimates[i];
                  if (estimate.distance < lowest_distance) {
                    selection = estimate;
                    lowest_distance = estimate.distance;
                  }
                }
                if (selection !== null) {
                  if (selection.spot !== _this.drag.child.index) {
                    _this._changePosition(_this.drag.child.id, selection.spot);
                    _this.render();
                  }
                }
                $child.css({
                  transform: "translate(" + ui.position.left + "px, " + ui.position.top + "px)"
                });
                ui.position.top = 0;
                return ui.position.left = 0;
              };
            })(this),
            stop: (function(_this) {
              return function(e, ui) {
                var $child, x, y;
                child = _this.drag.child;
                $child = child.el;
                x = $child.offset().left - _this.drag.offsetX;
                y = $child.offset().top - _this.drag.offsetY;
                _this._toggleChildState(child.id, false, "dragging");
                _this.render();
                return _this.drag = null;
              };
            })(this)
          }));
        }
        return _results;
      }
    },
    _toggleResizing: function(enabled) {
      var has_snap_sizes, increment_sizes, increment_x, increment_y, max_width, min_height, min_width, options, refresh_rate, render_on_move, resize, self, snap_sizes;
      if (this.state.resize.enabled && enabled !== false) {
        self = this;
        options = this.state.resize;
        min_width = options.min.w;
        min_height = options.min.h;
        max_width = (this.grid.columns * this.grid.itemWidth) + (this.grid.columns * this.grid.gutter.x) - this.grid.gutter.x;
        refresh_rate = options.refreshRate;
        snap_sizes = options.sizes;
        has_snap_sizes = $.isArray(snap_sizes);
        increment_x = this.state.resize.increment.x;
        increment_y = this.state.resize.increment.y;
        if (this.calculates_width) {
          min_width = this.grid.colWidth;
          max_width = this.$container.width();
          increment_x = Math.round(this.$container.width() / this.grid.columns);
        }
        increment_sizes = increment_x >= 1 || increment_y >= 1;
        render_on_move = options.renderOn === "mousemove";
        this.resize = {
          min_width: min_width,
          max_width: max_width,
          min_height: min_height,
          snap_sizes: snap_sizes,
          has_snap_sizes: has_snap_sizes,
          increment_sizes: increment_sizes,
          increment_x: increment_x,
          increment_y: increment_y,
          refresh_rate: refresh_rate,
          render_on_move: render_on_move
        };
        this.$container.off('.ss-resize').on("mousedown.ss-resize", options.handle, (function(_this) {
          return function(e) {
            var $el, child;
            $el = $(e.target).closest("*[data-ssid]");
            child = _this._getChildByElement($el);
            _this.resize.child = child;
            _this.resize.mousedown = true;
            _this.resize.resizing = false;
            _this.resize.start = {
              h: $el.height(),
              w: $el.outerWidth(),
              x: e.pageX,
              y: e.pageY
            };
            _this._toggleChildState(child.id, true, "resizing");
            $(e.target).addClass("ss-resizing");
            $(e.target).data('ss', _this);
            return $(e.target).data('ss-resize', _this.resize);
          };
        })(this));
        $(window).on("mousemove.ss-resize mouseup.ss-resize", (function(_this) {
          return function(e) {
            var el, ss, ss_resize;
            el = $('.ss-resizing');
            if (el.length !== 0) {
              ss_resize = el.data('ss-resize');
              if (e.type === "mousemove" && !ss_resize.resizing) {
                resize(e);
                setTimeout(function() {
                  return ss_resize.resizing = false;
                }, ss_resize.refresh_rate);
              }
              if (e.type === "mouseup") {
                resize(e);
                el.removeClass("ss-resizing");
                ss = el.data('ss');
                ss_resize.mousedown = false;
                ss._toggleChildState(ss_resize.child.id, false);
                if (!ss_resize.render_on_move) {
                  return ss.render();
                }
              }
            }
          };
        })(this));
        return resize = (function(_this) {
          return function(e) {
            var child, closest, el, i, minDistance, new_height, new_span, new_width, offset_x, offset_y, size, ss, ss_resize, start, _i, _len, _ref;
            el = $('.ss-resizing');
            ss_resize = $(el).data('ss-resize');
            ss = $(el).data('ss');
            ss_resize.resizing = true;
            child = ss_resize.child;
            start = ss_resize.start;
            offset_y = e.pageY - start.y;
            offset_x = e.pageX - start.x;
            if (ss_resize.has_snap_sizes) {
              new_height = start.h + offset_y;
              new_width = start.w + offset_x;
              closest = 0;
              minDistance = 9999999;
              _ref = ss_resize.ss_resize.snap_sizes;
              for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                size = _ref[i];
                if (size[0] <= new_width || size[1] <= new_height) {
                  closest = i;
                }
              }
              new_width = ss_resize.snap_sizes[closest][0];
              new_height = ss_resize.snap_sizes[closest][1];
            } else if (ss_resize.increment_sizes) {
              new_width = start.w + Math.ceil(offset_x / ss_resize.increment_x) * ss_resize.increment_x;
              new_height = start.h + Math.ceil(offset_y / ss_resize.increment_y) * ss_resize.increment_y;
            }
            if (new_width < ss_resize.min_width) {
              new_width = ss_resize.min_width;
            }
            if (new_height < ss_resize.min_height) {
              new_height = ss_resize.min_height;
            }
            if (new_width > ss_resize.max_width) {
              new_width = ss_resize.max_width;
            }
            if (ss.calculates_width) {
              new_span = Math.floor(new_width / ss.grid.colWidth);
              child.el.attr('data-ss-span', new_span);
            }
            child.el.css({
              width: new_width,
              height: new_height
            });
            ss._parseChild(child.id);
            if (ss_resize.render_on_move) {
              return ss.render();
            }
          };
        })(this);
      }
    },
    _toggleResponsive: function(enabled) {
      var refresh_rate, resizing, self, timeout;
      if (this.state.responsive.enabled && enabled !== false) {
        self = this;
        refresh_rate = this.state.responsive.refreshRate;
        resizing = false;
        timeout = null;
        return $(window).on('resize.ss-responsive', (function(_this) {
          return function() {
            if (!resizing) {
              resizing = true;
              clearTimeout(timeout);
              return timeout = setTimeout(function() {
                self._calculateGrid();
                self.render();
                return resizing = false;
              }, refresh_rate);
            }
          };
        })(this));
      }
    }
  };
  return $.fn[pluginName] = function(options) {
    var args, returns, scoped_name;
    args = arguments;
    scoped_name = "plugin_" + pluginName;
    if (options === void 0 || typeof options === "object") {
      return this.each(function() {
        if (!$.data(this, scoped_name)) {
          return $.data(this, scoped_name, new Plugin(this, options));
        }
      });
    } else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
      returns = void 0;
      this.each(function() {
        var instance;
        instance = $.data(this, scoped_name);
        if (instance instanceof Plugin && typeof instance[options] === "function") {
          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }
        if (options === "destroy") {
          return $.data(this, scoped_name, null);
        }
      });
      if (returns !== void 0) {
        return returns;
      } else {
        return this;
      }
    }
  };
})(jQuery, window, document);
