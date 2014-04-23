/*  Copyright (c) 2014, Jelmer Tiete.
 *  All rights reserved.
 *
 * coap-rd is licensed under an MIT +no-false-attribs license.
 * All rights not explicitly granted in the MIT license are reserved.
 * See the included LICENSE file for more details.
 */

const coap            = require('coap')
    , url             = require('url')
    , requestHandlers = require("./requestHandlers")
    , server          = coap.createServer()
    , S               = require('string')

var handle = {}
handle["/"] = requestHandlers.root;
handle["/.well-known/core"] = requestHandlers.core;
handle["/rd"] = requestHandlers.rd;
handle["/rd-lookup"] = requestHandlers.rdlookup;
handle["/rd-group"] = requestHandlers.rdgroup;

function route(handle, pathname, response, request) {
  console.log("About to route a request for " + pathname);
  //first look if there is a requesthandler for the path
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  //no handler, are we looking for a resource entry in db?
  } else if(S(pathname).startsWith('/rd/')){
    console.log("/rd/ found, searching db")//search db
    requestHandlers.edit(response, request, pathname);

  }else{
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
