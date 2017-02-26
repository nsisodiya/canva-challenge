const SERVER_URL = window.location.origin;
define("ajax", function (AjaxPooler) {
  window.AjaxPooler = AjaxPooler;
  var ajax = {
    get (config) {
      return AjaxPooler.addRequestInPool({
        method: "GET",
        url: `${SERVER_URL}${config.url}`
      });
    },
    post(config) {
      return AjaxPooler.addRequestInPool({
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: config.body,
        url: `${SERVER_URL}${config.url}`
      });
    }
  };
  return ajax;
});
