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
        var endpoint = parameter.ep;
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