/**
 * Created by narendrasisodiya on 25/02/17.
 */
/*
 * This Pool will maintain a Queue.
 * The idea is very simple. Let suppose, you set Limit is 10, then this will only allow 10 XHR requests at a given a time.
 * If Application has to request more than 10 request, they will wait.
 * */

define("AjaxPooler", function () {
  var findAndRemoveFromArray = function (arr, val) {
    var i = arr.indexOf(val);
    if (i !== -1) {
      arr.splice(i, 1);
    }
  };

  class AjaxPooler {
    constructor(limit) {
      this.limit = limit;
      this.activeRequests = [];
      this.waitingroom = [];
    }

    addRequestInPool(reqConfig) {
      //If there is a
      //CAN I accept this request ?
      if (this.activeRequests.length < this.limit) {
        const {url} = reqConfig;
        delete reqConfig.url;
        console.log("Fetching ", this.activeRequests.length, this.waitingroom.length, url, reqConfig);
        const p = fetch(
          url,
          reqConfig
        ).then((response) => {
          //We have received a XHR request, That means, we can fire a new request.
          findAndRemoveFromArray(this.activeRequests, p);
          this.pickANewRequestFromWaiting();
          return response.json();
        });
        this.activeRequests.push(p);
        return p;
      } else {
        //This will go in wait queue.
        console.log("Sorry, Pool is full", this.activeRequests.length, this.waitingroom.length, reqConfig.url, reqConfig);
        var innerMethods = {};
        var p1 = new Promise(function (resolve, reject) {
          innerMethods.reject = reject;
          innerMethods.resolve = resolve;
        });
        this.waitingroom.push({
          reqConfig,
          innerMethods,
        });
        return p1;
      }
    }

    pickANewRequestFromWaiting() {
      ///async exec
      setTimeout(() => {
        //Remove the element based on index.
        if (this.waitingroom[0] !== undefined) {
          //We have a Fresh Request which can we send.
          //Step 1 - Take it out from WaitingRoom Queue.
          var {reqConfig, innerMethods} = this.waitingroom[0];
          this.waitingroom.splice(0, 1);
          //PAssing the request again in Queue, But this time, this will be successful because we
          //have remove an element from array  - this.activeRequests;
          try {
            innerMethods.resolve(this.addRequestInPool(reqConfig));
          } catch (ex){
            console.error(ex);
          }
        }
      }, 0);

    }
  }
  return new AjaxPooler(200);
});
