define("ajax", function () {
  var ajax = {
    get (config) {
      return fetch(
        config.url,
        {
          method: "GET"
        })
        .then(function (response) {
          return response.json();
        });
    },
    post(config) {
      return fetch(
        config.url,
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
