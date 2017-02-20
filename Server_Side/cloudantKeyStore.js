var cache = require('./cache/cloudantCache.js')

/**
 * A local file-based key value store.
 * This implements the KeyValStore interface.
 */
var CloudantKeyValStore = (function () {
    function CloudantKeyValStore() {
        /**
         * Set the value associated with name.
         * @param name
         * @param cb function(err)
         */
        this.setValue = function (name, value, cb) {
            
            console.log ( "2 new value is :" +  value);
            cache.readObjectFromCache( name)
            .catch(function(err){
                console.log ( " data not found for key:" + name);
                return null ;
            })

            .then(function(data){
                if ( data){
                    console.log ( "7 : rev is " + data._rev)
                    
                    value = JSON.parse( value)
                    value._rev = data._rev;
                    console.log (" 5 new value :" + value);
                    cache.addObjectToCacheCB( name, value , cb)
                }else {
                    cache.addObjectToCacheCB( name, JSON.parse(value) , cb)
                }
                
            });
           /*cache.addObjectToCacheCB( name, JSON.parse(value) , function(err){
                if ( err && err.statusCode == 409){
                    cache.readObjectFromCache(name)
                    .then( function( dbObj){
                        console.log ( "addObjectToCacheCB returned 409 Error. OBJECT: " + JSON.stringify( dbObj) );
                        value._rev = dbObj._rev ;
                        console.log ( "3 new value is :" + JSON.stringify( value));
                        console.log ( "4 new value is :" + value);

                        cache.addObjectToCache( name, JSON.parse(value))
                        .then(function(objectKey){
                            console.log ( "added object with key" + objectKey);
                            console.log ( "value was " + JSON.stringify(value) );
                            cb(null);
                        })
                    })
                    .catch(function(err) { // shouldn't get here
                        console.log(err);
                        cb(err);
                    });
                    
                }else if ( err){
                    cb(err)
                }else {
                    cb (null)
                }
                
            }); */
        };

        this.getValue = function(name, cb){
            cache.readObjectFromCacheCB( name, function(err,data){
                if ( err){
                    return cb(null, null);
                }else{
                    console.log ( "read data :" + JSON.stringify(data) );
                    if(data){
                        return cb(null, JSON.stringify(data))
                    }else{
                        return cb(null, null)
                    }
                    
                }
            })
        }
        
    }
    
    return CloudantKeyValStore;
}()); // end CacheKeyValStore

module.exports = CloudantKeyValStore ;