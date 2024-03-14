"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.style = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Deprecated: Moved to `react-time-ago`.
var oneOfType = _propTypes["default"].oneOfType,
    arrayOf = _propTypes["default"].arrayOf,
    string = _propTypes["default"].string,
    number = _propTypes["default"].number,
    shape = _propTypes["default"].shape,
    func = _propTypes["default"].func; // The first step isn't required to define `minTime` or `test()`.

var step = oneOfType([shape({
  minTime: number,
  formatAs: string.isRequired
}), shape({
  test: func,
  formatAs: string.isRequired
}), shape({
  minTime: number,
  format: func.isRequired
}), shape({
  test: func,
  format: func.isRequired
})]); // Formatting style.

var style = oneOfType([// Not using `oneOf()` here, because that way
// this package wouldn't support some hypothetical
// new styles added to `javascript-time-ago` in some future.
string, shape({
  steps: arrayOf(step).isRequired,
  labels: oneOfType([string, arrayOf(string)]).isRequired
})]);
exports.style = style;
//# sourceMappingURL=PropTypes.js.map