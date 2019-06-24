//const SERVER_URL = window.location.origin;
var getServerURL = function () {
  return `http://canvaServer${parseInt(Math.random()*8) + 1}:${window.location.port}`;
};
define("ajax", function (AjaxPooler) {
  window.AjaxPooler = AjaxPooler;
  var ajax = {
    get (config) {
      return AjaxPooler.addRequestInPool({
        method: "GET",
        url: `${getServerURL()}${config.url}`
      });
    },
    post(config) {
      return AjaxPooler.addRequestInPool({
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: config.body,
        url: `${getServerURL()}${config.url}`
      });
    }
  };
  return ajax;
});
