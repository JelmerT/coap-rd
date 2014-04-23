/*  Copyright (c) 2014, Jelmer Tiete.
 *  All rights reserved.
 *
 * coap-rd is licensed under an MIT +no-false-attribs license.
 * All rights not explicitly granted in the MIT license are reserved.
 * See the included LICENSE file for more details.
 */

const   url           = require('url')
      , level         = require('level')
      , ttl           = require('level-ttl')
      , shortId       = require('shortid')
      , S             = require('string')
      , InvertedIndex = require('level-inverted-index')

// The default time to live of a db entry
var DEFAULT_TTL = (60 * 60 * 24)

//    This will create or open the underlying LevelDB store + ttl.
var db = ttl(level('./db', { valueEncoding: 'json' }))
//var indexDb = InvertedIndex(db, 'index')

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
          var lifetime = DEFAULT_TTL // lifetime default
        if(parameter.con) //context - optional
          value['con'] = parameter.con //TODO check length and input

        value['rs']= request.payload.toString('utf-8');
        var id = shortId.generate(); //TODO check db for uniqueness?

        db.put(id, value, { ttl: lifetime }, function (err) {
          if (err) return console.log('Failed to write to DB', err) // some kind of I/O error
          db.get(id, function (err, value) {
            if (err) return console.log('Failed to read from DB', err) // likely the key was not found
            console.log('Added new entry:',id, value)
                    //run an index batch
          console.log('indexing')
          //indexDb.start()
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
            var lifetime = DEFAULT_TTL // lifetime default
          if(parameter.con) //context - optional
            value['con'] = parameter.con; //TODO check length and input
          db.put(id, value, { ttl: lifetime }, function (err) {
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

  //get list of documents
  // indexDb.query(['1234'], function (err, docs){
    // if (err) return console.log('Failed to search DB', err) // likely the key was not found
    // console.log('result:',docs)
  // })

  response.statusCode = '205';
  response.end();
}

exports.edit = edit;
exports.root = root;
exports.core = core;
exports.rd = rd;
exports.rdgroup = rdgroup;
exports.rdlookup = rdlookup;