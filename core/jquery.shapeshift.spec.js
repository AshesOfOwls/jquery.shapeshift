describe("Shapeshift", function () {
  describe("when instantiating", function () {
    it("should create plugin_shapeshift data", function () {
      var $shapeshift = $("<div></div>").shapeshift();
      expect($shapeshift.data("plugin_shapeshift")).toBeDefined();
    });
  });
});
