define("sequentialExec", function () {
  const sequentialExec = function (arr, callback) {
    var pp = Promise.resolve();
    arr.forEach(function (v, i, A) {
      pp = pp.then(function () {
        return callback(v, i, A);
      });
    });
    return pp;
  };
  return sequentialExec;
});
