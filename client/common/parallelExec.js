define("parallelExec", function () {
  const parallelExec = function (arr, callback) {
    var pArray = [];
    arr.forEach(function (v, i, A) {
      pArray.push(callback(v, i, A));
    });
    return Promise.all(pArray);
  };
  return parallelExec;
});
