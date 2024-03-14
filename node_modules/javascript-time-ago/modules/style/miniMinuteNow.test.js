function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import style from './miniMinuteNow.js';
import TimeAgo from '../TimeAgo.js';
import { hour, minute, day, month, year } from '../steps/index.js';
describe('style/mini-minute-now', function () {
  it('should format relative date/time (round: "floor")', function () {
    var timeAgo = new TimeAgo('en');

    var formatInterval = function formatInterval(secondsPassed) {
      return timeAgo.format(-secondsPassed * 1000, _objectSpread(_objectSpread({
        now: 0
      }, style), {}, {
        round: 'floor'
      }));
    };

    formatInterval(0).should.equal('now');
    formatInterval(0.9).should.equal('now');
    formatInterval(1).should.equal('now');
    formatInterval(59.9).should.equal('now');
    formatInterval(60).should.equal('1m');
    formatInterval(1.9 * minute).should.equal('1m');
    formatInterval(2 * minute).should.equal('2m');
    formatInterval(2.9 * minute).should.equal('2m');
    formatInterval(3 * minute).should.equal('3m'); // …

    formatInterval(59.9 * minute).should.equal('59m');
    formatInterval(60 * minute).should.equal('1h');
    formatInterval(1.9 * hour).should.equal('1h');
    formatInterval(2 * hour).should.equal('2h');
    formatInterval(2.9 * hour).should.equal('2h');
    formatInterval(3 * hour).should.equal('3h'); // …

    formatInterval(23.9 * hour).should.equal('23h');
    formatInterval(24 * hour).should.equal('1d');
    formatInterval(2 * day).should.equal('2d');
    formatInterval(7 * day).should.equal('7d');
    formatInterval(30 * day).should.equal('30d');
    formatInterval(month).should.equal('1mo');
    formatInterval(360 * day).should.equal('11mo');
    formatInterval(366 * day).should.equal('1yr');
  });
});
//# sourceMappingURL=miniMinuteNow.test.js.map