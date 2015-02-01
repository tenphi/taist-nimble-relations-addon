var _responseHandlers = [],
  listening = false;

function listenToRequests() {
  var originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function() {
    listenForRequestFinish(this);
    originalSend.apply(this, arguments);
  }
}

function listenForRequestFinish(request) {
  var originalOnReadyStateChange = request.onreadystatechange;

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      _responseHandlers.forEach(function(handler) {
        handler(request);
      });
    }

    if (originalOnReadyStateChange) {
      originalOnReadyStateChange.apply(request, arguments);
    }
  };
}

var xhrWrapper = {

  onRequestFinish: function(handler) {
    _responseHandlers.push(handler);
    if (!listening) {
      listenToRequests();
    }
  },

  isListening: function() {
    return listening;
  }

};