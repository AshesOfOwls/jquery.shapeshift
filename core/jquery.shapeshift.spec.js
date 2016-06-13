describe('Shapeshift', function () {
  describe('when instantiating without any options', function () {
    var $shapeshift;

    beforeEach(function () {
      $shapeshift = $('<div></div>').shapeshift();
    });

    it('should create plugin_shapeshift data', function () {
      expect($shapeshift.data('plugin_shapeshift')).toBeDefined();
    });

    describe('when a child element exists', function () {
      var colWidth = 123;

      beforeEach(function () {
        $shapeshift = $('<div><div style="width:' + colWidth + 'px;"></div></div>').shapeshift();
      });

      it('should have property colWidth to have the width of that child', function () {
        expect($shapeshift.data('plugin_shapeshift').colWidth).toEqual(colWidth);
      });
    });
  });
});
