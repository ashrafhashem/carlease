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
            
            //console.log ( "2 new value is :" +  value);
            cache.readObjectFromCache( name)
            .catch(function(err){
                //console.log ( " data not found for key:" + name);
                return null ;
            })

            .then(function(data){
                if ( data){
                    //console.log ( "7 : rev is " + data._rev)
                    
                    value = JSON.parse( value)
                    value._rev = data._rev;
                    //console.log (" 5 new value :" + value);
                    cache.addObjectToCacheCB( name, value , cb)
                }else {
                    cache.addObjectToCacheCB( name, JSON.parse(value) , cb)
                }
                
            });
           
        };

        this.getValue = function(name, cb){
            cache.readObjectFromCacheCB( name, function(err,data){
                if ( err){
                    return cb(null, null);
                }else{
                    //console.log ( "read data :" + JSON.stringify(data) );
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