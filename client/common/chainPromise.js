define("chainPromise", function () {
  const chainPromise = function (pArr, data) {
    return pArr.reduce(function (lastPromise, fn) {
      return lastPromise.then(fn);
    }, Promise.resolve(data));
  };
  return chainPromise;
});
