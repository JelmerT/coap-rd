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

const   url     = require('url')
      , level   = require('level')
      , ttl     = require('level-ttl')
      , shortId = require('shortid')
      , S       = require('string')

// The default time to live of a db entry
var DEFAULT_TTL = (60 * 60 * 24)

//    This will create or open the underlying LevelDB store + ttl.
var db = ttl(level('./db', { valueEncoding: 'json' }))

function root(response,request) {
  console.log("Request handler 'root' was called.");

  response.statusCode = '404'; //not found
  response.end();
}

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
              response.statusCode = '402'; //bad option
          }
        }else{
              response.statusCode = '404'; //not found
        }

        break;
      case 'PUT':
        response.statusCode = '405'; //mothode not allowed
        break;
      default:
        response.statusCode = '404'; //not found
    }
  response.end();
}

function rd(response,request) {
  console.log("Request handler 'rd' was called.");
  var parameter = url.parse(request.url, true).query;

  //TODO check content type
  switch (request.method){
    case 'POST':
      if(parameter.ep){ //end point - mandatory
        var value = {};
        value['ep'] = parameter.ep; //TODO check length and input
        if(parameter.d) //domain - optional
          value['d'] = parameter.d;  //TODO check length and input
        if(parameter.et) //endpoint type - optional
          value['et'] = parameter.et;  //TODO check length and input
        if(parameter.lt) //lifetime - optional
          var lifetime = parameter.lt;  //TODO check length and input
        else
          var lifetime = DEFAULT_TTL; //24hr lifetime standard
        if(parameter.con) //context - optional
          value['con'] = parameter.con; //TODO check length and input

        value['rs']= request.payload.toString('utf-8');
        var id = shortId.generate(); //TODO check db for uniqueness?

        db.put(id, value, { ttl: lifetime }, function (err) {
          if (err) return console.log('Failed to write to DB', err) // some kind of I/O error
          db.get(id, function (err, value) {
            if (err) return console.log('Failed to read from DB', err) // likely the key was not found
            console.log('Added new entry:',id, value)
            })
        })

        response.statusCode = '201'; //created
        response.write('/rd/' + id);

      }else{
        response.statusCode = '400'; //bad request
      }
      break;
    //TODO add get put delete?
    default:
    response.statusCode = '400'; //bad request
  }
  response.end();
}

function edit(response, request, pathname) {
  console.log("Request handler 'edit' was called.");
  var id = S(pathname).chompLeft('/rd/').s

  //look for id
  db.get(id, function (err, value) {
    if (err){
      response.statusCode = '404'; //not found
      console.log('Failed to read from DB', err) // likely the key was not found
      console.log('id: %s not found', id)
    }
    else{
      console.log('found entry:',id, value)
      switch (request.method){
        case 'PUT': //node updating itself
          console.log("Updating entry", id)
          var parameter = url.parse(request.url, true).query;
          //TODO Resources are not upgradeable acording to standard. Warn client if he adds a payload!
          if(parameter.et) //endpoint type - optional
            value['et'] = parameter.et;  //TODO check length and input
          if(parameter.lt) //lifetime - optional
            var lifetime = parameter.lt  //TODO check length and input
          else
            var lifetime = DEFAULT_TTL //24hr lifetime standard
          if(parameter.con) //context - optional
            value['con'] = parameter.con; //TODO check length and input
          db.put(id,value, { ttl: lifetime }, function (err) { //TODO add parameters
            if (err) return console.log('Failed to write to DB', err) // some kind of I/O error
            db.get(id, function (err, value) {
              if (err) return console.log('Failed to read from DB', err) // likely the key was not found
              console.log('Updated entry:',id, value)
            })
          })
          response.statusCode = '204' //changed //TODO fix status if db failed
          break;
        case 'DELETE': //node deleting itself
          console.log("Deleting entry", id)
          db.del(id, function (err, value) {
            if (err) return console.log('Failed to read from DB', err) // likely the key was not found
          })
          response.statusCode = '202'; //deleted //TODO fix status if db failed
          break;
        default:
          response.statusCode = '400'; //bad request
          break;
      }
    }
  response.end();
  })

}

function rdgroup(response, request) {
  console.log("Request handler 'rdgroup' was called.");

    response.statusCode = '205';
    response.end();
}

function rdlookup(response) {
  console.log("Request handler 'rdlookup' was called.");

    response.statusCode = '205';
    response.end();
}

exports.edit = edit;
exports.root = root;
exports.core = core;
exports.rd = rd;
exports.rdgroup = rdgroup;
exports.rdlookup = rdlookup;