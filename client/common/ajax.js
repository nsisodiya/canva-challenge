const SERVER_URL = window.location.origin;
define("ajax", function () {
  var ajax = {
    get (config) {
      return fetch(
        `${SERVER_URL}${config.url}`,
        {
          method: "GET"
        })
        .then(function (response) {
          return response.json();
        });
    },
    post(config) {
      return fetch(
        `${SERVER_URL}${config.url}`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          body: config.body,
        })
        .then(function (response) {
          return response.json();
        });
    }
  };
  return ajax;
});
