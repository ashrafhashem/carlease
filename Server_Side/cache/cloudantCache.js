

// Now lets get cfenv and ask it to parse the environment variable
var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();
var credentials = {}
var fs = require('fs');
var tracing = require('../tools/traces/trace.js');

var configFile = require('../configurations/configuration.js');
var db;

 
    
function initDBConnection() {
    // Within the application environment (appenv) there's a services object
    var services = appenv.services;
    // The services object is a map named by service so we extract the one for Redis
    var cloudant_services = services["cloudant"];

    if (cloudant_services){
        // We now take the first bound Redis service and extract it's credentials object
        credentials = cloudant_services[0].credentials;
    }else{ // not on bluemix
         credentials.url = configFile.config.cloudant_url ;
    }

    cloudant = require('cloudant')({ url: credentials.url, plugin:'retry', retryAttempts:5, retryTimeout:1000  });

    // check if DB exists if not create
    return new Promise(function( resolve, reject){
        cloudant.db.create(configFile.config.cloudant_db, function(err, res) {
            if (err) {
                console.log('Could not create new db: ' + configFile.config.cloudant_db + ', it might already exist.');
             }else {
                console.log ("Created db");   
            }
            db = cloudant.use(configFile.config.cloudant_db);
            resolve(true)
        });

    })
    

    
}



/// Connect to cloudant service
//var cloudant=Cloudant( { url: credentials.url, plugin:'retry', retryAttempts:5, retryTimeout:1000  })
//var db = cloudant.db.use('car-lease-demo-bluemix')



/*function addUsersToCache( usersToSecurityContext){
    let promises = [];
    users.forEach(function (user) {
        promises.push(addUserToCache( user));
    });
    return Promise.all(promises);
}*/


function addObjectToCacheCB( objectKey, object, cb ){
    
        db.insert( object, objectKey, function( err, result){
            if (!err){
                tracing.create('INFO', 'Cache',  objectKey + ' added to cache ');
                cb(null)
            }
            else{
                tracing.create('INFO', 'Cache', 'Failed to add ' + objectKey  + 'to cache  using redis Error: '+JSON.stringify(err));
                cb(err)
            }
        });
    
}

function addObjectToCache( objectKey, object ){
    return new Promise(function(resolve, reject) {
        db.insert( object, objectKey , function( err, result){
            if (!err){
                        // Successfully enrolled registrar and set this user as the chain's registrar which is authorized to register other users.
                tracing.create('INFO', 'Cache',  objectKey + ' added to cache ');
                resolve(objectKey);
            }
            else{
                
                tracing.create('INFO', 'Cache', 'Failed to add ' + objectKey  + 'to cache  using redis Error: '+JSON.stringify(err));
                reject(err);
            }
        });
    });
    
}

function readObjectFromCache( objectKey){
    return new Promise(function(resolve, reject) {
        db.get(objectKey,function(err, data) {
            if (!err){
                tracing.create('INFO', 'readObjectFromCache', objectKey + ' read  from cache ');
                 console.log ( data)
                resolve( data)
               
            }else {
                tracing.create('INFO', 'readObjectFromCache', 'Failed to read  ' + objectKey  + 'from cache  using redis Error: '+JSON.stringify(err));
                reject(err);
            }
        });
    });
}

function readObjectFromCacheCB( objectKey, cb){
   
        db.get(objectKey,function(err, data) {
            if (!err){
                tracing.create('INFO', 'Cache', objectKey + ' read  from cache ');
                 console.log ( data)
                 cb(null, data)
                
               
            }else {
                tracing.create('INFO', 'Cache', 'Failed to read  ' + objectKey  + 'from cache  using redis Error: '+JSON.stringify(err));
                cb(err);
            }
        });
    
}



module.exports = {
    addObjectToCache: addObjectToCache,
    readObjectFromCache : readObjectFromCache,
    addObjectToCacheCB: addObjectToCacheCB,
    readObjectFromCacheCB: readObjectFromCacheCB,
    initDBConnection: initDBConnection
    
}
