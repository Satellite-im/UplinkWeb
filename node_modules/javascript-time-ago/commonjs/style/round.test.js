"use strict";

var _round = _interopRequireDefault(require("./round.js"));

var _TimeAgo = _interopRequireDefault(require("../TimeAgo.js"));

var _index = require("../steps/index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

describe('style/round', function () {
  it('should format relative time (English) (round: "floor")', function () {
    var timeAgo = new _TimeAgo["default"]('en');
    var now = new Date(2016, 3, 10, 22, 59).getTime();

    var formatInterval = function formatInterval(secondsPassed) {
      return timeAgo.format(now - secondsPassed * 1000, _objectSpread(_objectSpread({
        now: now
      }, _round["default"]), {}, {
        round: 'floor'
      }));
    };

    formatInterval(0).should.equal('just now');
    formatInterval(0.9).should.equal('just now');
    formatInterval(1).should.equal('1 second ago');
    formatInterval(59.9).should.equal('59 seconds ago');
    formatInterval(60).should.equal('1 minute ago');
    formatInterval(1.9 * 60).should.equal('1 minute ago');
    formatInterval(2 * 60).should.equal('2 minutes ago');
    formatInterval(2.9 * 60).should.equal('2 minutes ago');
    formatInterval(3 * 60).should.equal('3 minutes ago'); // …

    formatInterval(59.9 * 60).should.equal('59 minutes ago');
    formatInterval(60 * 60).should.equal('1 hour ago');
    formatInterval(1.9 * 60 * 60).should.equal('1 hour ago');
    formatInterval(2 * 60 * 60).should.equal('2 hours ago');
    formatInterval(2.9 * 60 * 60).should.equal('2 hours ago');
    formatInterval(3 * 60 * 60).should.equal('3 hours ago'); // …

    formatInterval(23.9 * 60 * 60).should.equal('23 hours ago');
    formatInterval(24 * 60 * 60).should.equal('1 day ago');
    formatInterval(1.9 * _index.day).should.equal('1 day ago');
    formatInterval(2 * _index.day).should.equal('2 days ago');
    formatInterval(2.9 * _index.day).should.equal('2 days ago');
    formatInterval(3 * _index.day).should.equal('3 days ago'); // …

    formatInterval(6.9 * _index.day).should.equal('6 days ago');
    formatInterval(7 * _index.day).should.equal('1 week ago'); // …

    formatInterval(3.9 * 7 * _index.day).should.equal('3 weeks ago');
    formatInterval(4 * 7 * _index.day).should.equal('4 weeks ago');
    formatInterval(30.51 * _index.day).should.equal('1 month ago');
    formatInterval(1.9 * _index.month).should.equal('1 month ago');
    formatInterval(2 * _index.month).should.equal('2 months ago');
    formatInterval(2.9 * _index.month).should.equal('2 months ago');
    formatInterval(3 * _index.month).should.equal('3 months ago'); // …

    formatInterval(11.9 * _index.month).should.equal('11 months ago');
    formatInterval(12 * _index.month).should.equal('1 year ago');
    formatInterval(1.99 * _index.year).should.equal('1 year ago');
    formatInterval(2 * _index.year).should.equal('2 years ago'); // …
    // Test future dates.

    formatInterval(-1 * 3).should.equal('in 3 seconds');
    formatInterval(-1 * _index.month * 8).should.equal('in 8 months');
  });
  it('should format relative time (English) (round: "round")', function () {
    var timeAgo = new _TimeAgo["default"]('en');
    var now = new Date(2016, 3, 10, 22, 59).getTime();

    var formatInterval = function formatInterval(secondsPassed) {
      return timeAgo.format(now - secondsPassed * 1000, _objectSpread(_objectSpread({
        now: now
      }, _round["default"]), {}, {
        round: 'round'
      }));
    };

    formatInterval(0).should.equal('just now');
    formatInterval(0.49).should.equal('just now');
    formatInterval(0.5).should.equal('1 second ago');
    formatInterval(59.49).should.equal('59 seconds ago');
    formatInterval(59.5).should.equal('1 minute ago');
    formatInterval(1.49 * 60).should.equal('1 minute ago');
    formatInterval(1.5 * 60).should.equal('2 minutes ago');
    formatInterval(2.49 * 60).should.equal('2 minutes ago');
    formatInterval(2.5 * 60).should.equal('3 minutes ago'); // …

    formatInterval(59.49 * 60).should.equal('59 minutes ago');
    formatInterval(59.5 * 60).should.equal('1 hour ago');
    formatInterval(1.49 * 60 * 60).should.equal('1 hour ago');
    formatInterval(1.5 * 60 * 60).should.equal('2 hours ago');
    formatInterval(2.49 * 60 * 60).should.equal('2 hours ago');
    formatInterval(2.5 * 60 * 60).should.equal('3 hours ago'); // …

    formatInterval(23.49 * 60 * 60).should.equal('23 hours ago');
    formatInterval(23.5 * 60 * 60).should.equal('1 day ago');
    formatInterval(1.49 * _index.day).should.equal('1 day ago');
    formatInterval(1.5 * _index.day).should.equal('2 days ago');
    formatInterval(2.49 * _index.day).should.equal('2 days ago');
    formatInterval(2.5 * _index.day).should.equal('3 days ago'); // …

    formatInterval(6.49 * _index.day).should.equal('6 days ago');
    formatInterval(6.5 * _index.day).should.equal('1 week ago'); // …

    formatInterval(3.49 * 7 * _index.day).should.equal('3 weeks ago');
    formatInterval(3.5 * 7 * _index.day).should.equal('4 weeks ago');
    formatInterval(30.51 * _index.day).should.equal('1 month ago');
    formatInterval(1.49 * _index.month).should.equal('1 month ago');
    formatInterval(1.5 * _index.month).should.equal('2 months ago');
    formatInterval(2.49 * _index.month).should.equal('2 months ago');
    formatInterval(2.5 * _index.month).should.equal('3 months ago'); // …

    formatInterval(11.49 * _index.month).should.equal('11 months ago');
    formatInterval(11.5 * _index.month).should.equal('1 year ago');
    formatInterval(1.49 * _index.year).should.equal('1 year ago');
    formatInterval(1.5 * _index.year).should.equal('2 years ago'); // …
    // Test future dates.

    formatInterval(-1 * 3).should.equal('in 3 seconds');
    formatInterval(-1 * _index.month * 8).should.equal('in 8 months');
  });
  it('should return correct update interval (round: "floor")', function () {
    var timeAgo = new _TimeAgo["default"]('en');

    var _timeAgo$format = timeAgo.format(0, _round["default"], {
      now: 0,
      getTimeToNextUpdate: true,
      round: 'floor'
    }),
        _timeAgo$format2 = _slicedToArray(_timeAgo$format, 2),
        formattedDate = _timeAgo$format2[0],
        timeToNextUpdate = _timeAgo$format2[1];

    timeToNextUpdate.should.equal(1000);
  });
  it('should return correct update interval (round: "round")', function () {
    var timeAgo = new _TimeAgo["default"]('en');

    var _timeAgo$format3 = timeAgo.format(0, _round["default"], {
      now: 0,
      getTimeToNextUpdate: true
    }),
        _timeAgo$format4 = _slicedToArray(_timeAgo$format3, 2),
        formattedDate = _timeAgo$format4[0],
        timeToNextUpdate = _timeAgo$format4[1];

    timeToNextUpdate.should.equal(500);
  });
});
//# sourceMappingURL=round.test.js.map