// Deprecated: Moved to `react-time-ago`.
import PropTypes from 'prop-types';
var oneOfType = PropTypes.oneOfType,
    arrayOf = PropTypes.arrayOf,
    string = PropTypes.string,
    number = PropTypes.number,
    shape = PropTypes.shape,
    func = PropTypes.func; // The first step isn't required to define `minTime` or `test()`.

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

export var style = oneOfType([// Not using `oneOf()` here, because that way
// this package wouldn't support some hypothetical
// new styles added to `javascript-time-ago` in some future.
string, shape({
  steps: arrayOf(step).isRequired,
  labels: oneOfType([string, arrayOf(string)]).isRequired
})]);
//# sourceMappingURL=PropTypes.js.map