function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// This function is only used for backwards compatibility
// with legacy code that uses the older versions of this library.
export default function (step_) {
  var step = _objectSpread({}, step_);

  if (step.minTime !== undefined) {
    if (_typeof(step.minTime) === 'object') {
      for (var _i = 0, _Object$keys = Object.keys(step.minTime); _i < _Object$keys.length; _i++) {
        var key = _Object$keys[_i];

        if (key === 'default') {
          step.threshold = step.minTime["default"];
        } else {
          step["threshold_for_".concat(key)] = step.minTime[key];
        }
      }
    } else {
      step.threshold = step.minTime;
    }

    delete step.minTime;
  }

  if (step.formatAs) {
    step.unit = step.formatAs;
    delete step.formatAs;
  }

  return step;
}
//# sourceMappingURL=renameLegacyProperties.js.map