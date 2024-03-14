"use strict";

var _isStyleObject = _interopRequireDefault(require("./isStyleObject.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('isStyleObject', function () {
  it('should detect a style object', function () {
    (0, _isStyleObject["default"])({
      gradation: []
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      steps: []
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      flavour: 'long'
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      flavour: ['long']
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      labels: 'long'
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      labels: ['long']
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      units: ['now']
    }).should.equal(true);
    (0, _isStyleObject["default"])({
      future: true,
      round: 'floor',
      now: 0,
      getTimeToNextUpdate: true
    }).should.equal(false);
    (0, _isStyleObject["default"])('round').should.equal(false);
  });
});
//# sourceMappingURL=isStyleObject.test.js.map