var cache = require('./cache/cache.js')
var hfc = require('hfc')
/**
 * A local file-based key value store.
 * This implements the KeyValStore interface.
 */
var CacheKeyValStore = (function () {
    function CacheKeyValStore() {
        /**
         * Set the value associated with name.
         * @param name
         * @param cb function(err)
         */
        this.setValue = function (name, value, cb) {
            cache.addObjectToCacheCB( name, value , cb);
        };

        this.getValue = function(name, cb){
            cache.readObjectFromCacheCB( name, function(err,data){
                if ( err){
                    return cb(err);
                }else{
                    if(data){
                        return cb(null, data)
                    }else{
                        return cb(null, null)
                    }
                    
                }
            })
        }
        
    }
    
    return CacheKeyValStore;
}()); // end CacheKeyValStore

module.exports = CacheKeyValStore ;