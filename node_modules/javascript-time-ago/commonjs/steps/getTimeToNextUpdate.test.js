"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _getTimeToNextUpdate = _interopRequireWildcard(require("./getTimeToNextUpdate.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

describe('getTimeToNextUpdate', function () {
  it('should return infinity when there are no more steps, and it does not format as a unit (past)', function () {
    expect((0, _getTimeToNextUpdate["default"])(-4 * 60 * 1000, {
      minTime: 59.5,
      format: function format() {
        return '';
      }
    }, {
      now: 0,
      future: false,
      isFirstStep: true
    })).to.equal(_getTimeToNextUpdate.INFINITY);
  });
  it('should support date argument', function () {
    expect((0, _getTimeToNextUpdate["default"])(new Date(4 * 60 * 1000), {
      minTime: 60
    }, {
      now: 0,
      future: true,
      isFirstStep: true,
      nextStep: {}
    })).to.equal(3 * 60 * 1000 + 1);
  });
  it('should return this step\'s "minTime" timestamp (future)', function () {
    expect((0, _getTimeToNextUpdate["default"])(4 * 60 * 1000, {
      minTime: 60,
      format: function format() {
        return '';
      }
    }, {
      now: 0,
      future: true,
      isFirstStep: true,
      nextStep: {
        format: function format() {
          return '';
        }
      }
    })).to.equal(3 * 60 * 1000 + 1);
  });
  it('should return undefined when there is a next step and time to next update can not be reliably determined (formatAs) (past)', function () {
    expect((0, _getTimeToNextUpdate["default"])(-4 * 60 * 1000, {
      minTime: 60,
      formatAs: 'minute'
    }, {
      now: 0,
      future: false,
      isFirstStep: true,
      nextStep: {
        formatAs: 'unknown-time-unit'
      }
    })).to.be.undefined;
  });
  it('should get time to next update (no next step) (past)', function () {
    (0, _getTimeToNextUpdate["default"])(-4 * 60 * 1000, {
      formatAs: 'minute',
      minTime: 59.5
    }, {
      now: 0,
      future: false,
      isFirstStep: true
    }).should.equal(0.5 * 60 * 1000);
  });
  it('should get time to next update (no next step) (future)', function () {
    (0, _getTimeToNextUpdate["default"])(4 * 60 * 1000, {
      formatAs: 'minute',
      minTime: 59.5
    }, {
      now: 0,
      future: true,
      isFirstStep: true
    }).should.equal(0.5 * 60 * 1000 + 1);
  });
  it('should get time to next update (has prev/next step without `minTime`) (future)', function () {
    (0, _getTimeToNextUpdate["default"])(4 * 60 * 1000, {
      formatAs: 'minute',
      minTime: 59.5
    }, {
      now: 0,
      future: true,
      isFirstStep: true,
      nextStep: {
        formatAs: 'hour',
        test: function test() {
          return false;
        }
      }
    }).should.equal(0.5 * 60 * 1000 + 1);
  });
  it('should get time to next update (has `getTimeToNextUpdate`) (past)', function () {
    (0, _getTimeToNextUpdate["default"])(-4 * 60 * 1000, {
      formatAs: 'minute',
      minTime: 59.5,
      getTimeToNextUpdate: function getTimeToNextUpdate() {
        return 0.25 * 60 * 1000;
      }
    }, {
      now: 0,
      future: false,
      isFirstStep: true
    }).should.equal(0.25 * 60 * 1000);
  });
  it('should get time to next update (has `getTimeToNextUpdate`) (future)', function () {
    (0, _getTimeToNextUpdate["default"])(4 * 60 * 1000, {
      formatAs: 'minute',
      minTime: 59.5,
      getTimeToNextUpdate: function getTimeToNextUpdate() {
        return 0.25 * 60 * 1000;
      }
    }, {
      now: 0,
      future: true,
      isFirstStep: true
    }).should.equal(0.25 * 60 * 1000);
  });
  it('should get time to next update (has both unit and prev/next steps with `minTime`) (returns time to "minTime" of next step) (past)', function () {
    (0, _getTimeToNextUpdate["default"])(-59 * 60 * 1000, {
      formatAs: 'minute',
      minTime: 59.5
    }, {
      now: 0,
      future: false,
      isFirstStep: true,
      nextStep: {
        formatAs: 'hour',
        minTime: 59.5 * 60
      }
    }).should.equal(0.5 * 60 * 1000);
  });
  it('should get time to next update (has no unit but has prev/next step with `minTime`) (returns time to "minTime" of next step) (past)', function () {
    (0, _getTimeToNextUpdate["default"])(-59 * 60 * 1000, {
      format: function format() {},
      minTime: 59.5
    }, {
      now: 0,
      future: false,
      isFirstStep: true,
      nextStep: {
        formatAs: 'hour',
        minTime: 59.5 * 60
      }
    }).should.equal(0.5 * 60 * 1000);
  });
  it('should get time to next update (will be outside of the first step) (future)', function () {
    (0, _getTimeToNextUpdate["default"])(60 * 60 * 1000, {
      formatAs: 'hour',
      minTime: 60 * 60
    }, {
      now: 0,
      future: true,
      isFirstStep: true
    }).should.equal(1);
  });
});
describe('getStepChangesAt', function () {
  it('should work for "round" steps', function () {
    // Future.
    // Is at zero point.
    // No next step.
    // No tickable unit.
    // Doesn't update.
    (0, _getTimeToNextUpdate.getStepChangesAt)({
      unit: 'now'
    }, 0, {
      now: 0,
      future: false,
      prevStep: undefined
    }).should.equal(_getTimeToNextUpdate.INFINITY); // Past.
    // Is at zero point.
    // The next step is seconds.
    // Updates at the next step.

    (0, _getTimeToNextUpdate.getStepChangesAt)({
      unit: 'second',
      minTime: 1
    }, 0, {
      now: 0,
      future: false,
      prevStep: {}
    }).should.equal(1 * 1000); // Future.
    // Inside the first step.
    // Updates after zero point.

    (0, _getTimeToNextUpdate.getStepChangesAt)({
      unit: 'now'
    }, 0.9 * 1000, {
      now: 0,
      future: true,
      prevStep: undefined
    }).should.equal(0.9 * 1000 + 1); // Future.
    // The first step doesn't start at 0.
    // Outside of the first step.
    // Updates right after zero point.

    (0, _getTimeToNextUpdate.getTimeToStepChange)(undefined, 0.9 * 1000, {
      now: 0,
      future: true,
      prevStep: undefined
    }).should.equal(0.9 * 1000 + 1); // Past.
    // The current step is `undefined`.
    // The next step is the first step.
    // The first step doesn't start at 0.
    // Outside of the first step.
    // Updates at entering the first step.

    (0, _getTimeToNextUpdate.getStepChangesAt)({
      minTime: 1,
      unit: 'second'
    }, -0.9 * 1000, {
      now: 0,
      future: false,
      prevStep: {}
    }).should.equal(0.1 * 1000); // Future.
    // The first step doesn't start at 0.
    // Will output empty string after it exits the current step.

    (0, _getTimeToNextUpdate.getStepChangesAt)({
      minTime: 1,
      unit: 'second'
    }, 1.1 * 1000, {
      now: 0,
      future: true,
      prevStep: undefined
    }).should.equal(0.1 * 1000 + 1); // Past.
    // Next step is seconds.
    // The "next" step doesn't have `minTime`,
    // so "time to next update" couldn't be determined.

    expect((0, _getTimeToNextUpdate.getStepChangesAt)({
      unit: 'unknown-time-unit'
    }, 0, {
      now: 0,
      future: false,
      prevStep: {}
    })).to.be.undefined; // Past.
    // No next step.
    // The last step never changes.

    (0, _getTimeToNextUpdate.getTimeToStepChange)(undefined, 0, {
      now: 0,
      future: false,
      isFirstStep: undefined
    }).should.equal(_getTimeToNextUpdate.INFINITY); // Future.
    // Current step is seconds.
    // Updates after zero point.

    (0, _getTimeToNextUpdate.getStepChangesAt)({
      unit: 'second'
    }, 0, {
      now: 0,
      future: true,
      prevStep: undefined
    }).should.equal(1); // Past.
    // Next step is minutes.
    // Already at zero point, so no need to update at zero point.

    (0, _getTimeToNextUpdate.getStepChangesAt)({
      minTime: 60,
      formatAs: 'minute'
    }, 0, {
      now: 0,
      future: false,
      prevStep: {}
    }).should.equal(60 * 1000);
  });
});
//# sourceMappingURL=getTimeToNextUpdate.test.js.map