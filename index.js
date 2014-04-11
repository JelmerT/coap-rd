const coap        = require('coap')
    , url         = require('url')
    , requestHandlers = require("./requestHandlers")
    , server      = coap.createServer()

var handle = {}
handle["/"] = requestHandlers.start;
handle["/.well-known/core"] = requestHandlers.core;
handle["/rd"] = requestHandlers.rd;
handle["/rd-lookup"] = requestHandlers.rdlookup;
handle["/rd-group"] = requestHandlers.rdgroup;

function route(handle, pathname, response, request) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    console.log("No request handler found for " + pathname);
    response.statusCode = '404';
    response.end();
  }
}

function start(route, handle) {
  server.on('request', function(req, res) {
    var pathname = url.parse(req.url).pathname;
    console.log("Request for " + pathname + " received.");

    route(handle, pathname, res, req);
  })

  // the default CoAP port is 5683
  server.listen(5683)
  console.log("Server has started.");
}

start(route, handle);
