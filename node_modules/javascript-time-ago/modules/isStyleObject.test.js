import isStyleObject from './isStyleObject.js';
describe('isStyleObject', function () {
  it('should detect a style object', function () {
    isStyleObject({
      gradation: []
    }).should.equal(true);
    isStyleObject({
      steps: []
    }).should.equal(true);
    isStyleObject({
      flavour: 'long'
    }).should.equal(true);
    isStyleObject({
      flavour: ['long']
    }).should.equal(true);
    isStyleObject({
      labels: 'long'
    }).should.equal(true);
    isStyleObject({
      labels: ['long']
    }).should.equal(true);
    isStyleObject({
      units: ['now']
    }).should.equal(true);
    isStyleObject({
      future: true,
      round: 'floor',
      now: 0,
      getTimeToNextUpdate: true
    }).should.equal(false);
    isStyleObject('round').should.equal(false);
  });
});
//# sourceMappingURL=isStyleObject.test.js.map