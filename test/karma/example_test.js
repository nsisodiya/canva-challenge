// Writing unit tests is entirely optional for the challenge.
// However we have included this unit test harness should you prefer to develop in a TDD environment.

// http://chaijs.com/api
// https://mochajs.org
// http://sinonjs.org/docs


var getServerName = function () {
  return getServerURL().split("//")[1].split(":")[0]
};
var testFrequency = function () {
  var frequecy = {};
  Array.from(Array(800)).forEach(function (v, i) {
    var s = getServerName();
    if (frequecy[s] === undefined) {
      frequecy[s] = 0;
    } else {
      frequecy[s] = frequecy[s] + 1;
    }
  });

  //(100 - frequecy[s])/100
  return frequecy;
}

define("TESTCASES", function (ajax) {
  describe('This test', function () {

    it("Aajx should not be undefined", function () {
      expect(ajax).to.be.an("object");
      expect(ajax).to.have.property('get').that.is.a('function');
      expect(ajax.get({
        url: `/team?tournamentId=0&teamId=0`
      })).to.be.a('promise');

      console.log(testFrequency())
    });

    it('passes', function () {
      expect(2 + 2).to.equal(4);
    });

    it('supports spies', function () {
      var spy = sinon.spy();
      spy();
      expect(spy.callCount).to.equal(1);
    });

    it('supports stubs', function () {
      var stub = sinon.stub().returns(42);
      expect(stub()).to.equal(42);
    });
  });
});

