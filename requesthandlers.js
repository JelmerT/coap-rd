/*  Copyright (c) 2014, Jelmer Tiete.
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *  1. Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *  2. Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *  3. The name of the author may not be used to endorse or promote
 *     products derived from this software without specific prior
 *     written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS
 *  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 *  ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 *  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 *  DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 *  INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const url = require('url');

function core(response,request) {
  console.log("Request handler 'core' was called.");
    var parameter = url.parse(request.url, true).query;
    switch (request.method){
      case 'GET':
        if(parameter.rt){
          switch (parameter.rt){  //resource type
            case 'core.rd':
              response.statusCode = '205';
              response.setOption('Content-Format','application/link-format');
              response.write('</rd>;rt="core.rd"');
              break;
            case 'core.rd-group':
              response.statusCode = '205';
              response.setOption('Content-Format','application/link-format');
              response.write('</rd-group>;rt="core.rd-group"');
              break;
            case 'core.rd-lookup':
              response.statusCode = '205';
              response.setOption('Content-Format','application/link-format');
              response.write('</rd-lookup>;rt="core.rd-lookup"');
              break;
            case 'core.rd*':
              response.statusCode = '205';
              response.setOption('Content-Format','application/link-format');
              response.write('</rd>;rt="core.rd",</rd-lookup>;rt="core.rd-lookup",</rd-group>;rt="core.rd-group"');
              break;
            default:
              response.statusCode = '404';
          }
        }else{
              response.statusCode = '404';
        }

        response.end();

        break;
      case 'PUT':
        break;
      default:

    }
}

function rd(response,request) {
  console.log("Request handler 'rd' was called.");
  var parameter = url.parse(request.url, true).query;
  //TODO check content type
  switch (request.method){
    case 'POST':
      if(parameter.ep){ //end point - mandatory
        var endpoint = parameter.ep; //TODO check length and input
        if(parameter.d){ //domain - optional
            
          }
        if(parameter.et){ //endpoint type - optional
            
          }
        if(parameter.lt){ //lifetime - optional
            
          }
        if(parameter.con){ //context - optional
            
          }
          //create entry
        response.statusCode = '201'; //created
      }else{
        response.statusCode = '400'; //bad request
      }
      break;
    default:
    response.statusCode = '400'; //bad request
  }
  response.end();
}

function rdgroup(response, request) {
  console.log("Request handler 'rdgroup' was called.");

    response.statusCode = '205';
    response.end('205');
}

function rdlookup(response) {
  console.log("Request handler 'rdlookup' was called.");

    response.statusCode = '205';
    response.end('205');
}

exports.core = core;
exports.rd = rd;
exports.rdgroup = rdgroup;
exports.rdlookup = rdlookup;