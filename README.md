# CoAP Resource Directory Server

This is a node.js implementation of the **IETF CoRE Resource Directory** draft for CoAP. It is currently compatible with `draft-ietf-core-resource-directory-01`.

The draft can be found [here](http://datatracker.ietf.org/doc/draft-ietf-core-resource-directory/).

This implementation uses [node-coap](https://github.com/mcollina/node-coap) and [levelDB](https://github.com/Level/level) as key value storage for the different resources.

## Status
This is a very basic first implementation. Expect some bugs and missing parts.

## Use
Just start the server with `node index.js`. The server will be started on the standard CoAP port **5683**.
To run an IPv6 server instead of v4 change `server = coap.createServer()` to `server = coap.createServer({ type: 'udp6' })`

## Contributions
Any contribution or feedback is higly appreciated. Just add a pull request or post an issue or send me feedback over Twitter `@jelmt` or email.

## License
Copyright (c) 2013-2014 Jelmer Tiete <jelmer@tiete.be>

coap-rd is licensed under an MIT +no-false-attribs license.
All rights not explicitly granted in the MIT license are reserved.
See the included LICENSE file for more details.