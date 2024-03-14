import getStepDenominator from './getStepDenominator.js';
describe('getStepDenominator', function () {
  it('should support the older "unit" name', function () {
    getStepDenominator({
      unit: 'minute'
    }).should.equal(60);
  });
  it('should return 1 as a default "denominator"', function () {
    getStepDenominator({
      formatAs: 'exotic'
    }).should.equal(1);
  });
});
//# sourceMappingURL=getStepDenominator.test.js.map