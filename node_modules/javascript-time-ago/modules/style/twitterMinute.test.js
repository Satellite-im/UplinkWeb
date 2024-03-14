function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import twitter from './twitterMinute.js';
import TimeAgo from '../TimeAgo.js';
import { hour, minute, day, month, year } from '../steps/index.js';
describe('style/twitterMinute', function () {
  it('should format Twitter style relative time (English) (round: "floor")', function () {
    var timeAgo = new TimeAgo('en'); // April 10th, 2016.

    var now = new Date(2016, 3, 10, 22, 59).getTime();

    var formatInterval = function formatInterval(secondsPassed) {
      return timeAgo.format(now - secondsPassed * 1000, _objectSpread(_objectSpread({
        now: now
      }, twitter), {}, {
        round: 'floor'
      }));
    };

    formatInterval(0).should.equal('0m');
    formatInterval(59.9).should.equal('0m');
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
    formatInterval(day + 2 * minute + hour).should.equal('Apr 9'); // …
    // `month` is about 30.5 days.

    formatInterval(month * 3).should.equal('Jan 10');
    formatInterval(month * 4).should.equal('Dec 11, 2015');
    formatInterval(year).should.equal('Apr 11, 2015'); // Test future dates.
    // `month` is about 30.5 days.

    formatInterval(-1 * month * 8).should.equal('Dec 10');
    formatInterval(-1 * month * 9).should.equal('Jan 9, 2017');
  });
  it('should format Twitter style relative time (English) (round: "round")', function () {
    var timeAgo = new TimeAgo('en'); // April 10th, 2016.

    var now = new Date(2016, 3, 10, 22, 59).getTime();

    var formatInterval = function formatInterval(secondsPassed) {
      return timeAgo.format(now - secondsPassed * 1000, _objectSpread(_objectSpread({
        now: now
      }, twitter), {}, {
        round: 'round'
      }));
    };

    formatInterval(0).should.equal('0m');
    formatInterval(29.9).should.equal('0m');
    formatInterval(30).should.equal('1m');
    formatInterval(1.49 * minute).should.equal('1m');
    formatInterval(1.5 * minute).should.equal('2m');
    formatInterval(2.49 * minute).should.equal('2m');
    formatInterval(2.5 * minute).should.equal('3m');
  });
});
//# sourceMappingURL=twitterMinute.test.js.map