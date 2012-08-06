/**
  * console.info('Search engine based on %s and %s.', 'redis', 'node.js');
  * @version 0.1
  * @description 用于用户名等前缀匹配、文章标题等模糊检索
  */

var redis = require('redis');

var log = require('./log.js');
var config = require('../config.js').config;
redis.debug_mode = config.redis_debug_mode;
var isDebug = config.nodis_debug;
var REDISKEY = config.redis_key;
var data_store_enable = config.data_store_enable;
var step = config.prefix_search_step;
var stopWords = ['的','很','_','了','嘛','吗','哈',' ','与','是','不','谁','呢'];//and so on....

exports.createSearch = function(){
    return new Search();
};

function Search(){
    this.client = redis.createClient(config.redis_port, config.redis_server);
}

Search.prototype.putHashData = function(id, info, hashKey, fn){
    var client = this.client;
    client.hset(REDISKEY[hashKey], id, info, function(err, reply){
        if(err){
            fn(false);
        }
        else{
            fn(true);
        }
        return;
    });
};

Search.prototype.removeHashData = function(id, hashKey, fn){
    var client = this.client;
    client.hdel(REDISKEY[hashKey], id, function(err, reply){
        if(err){
            fn(false);
        }
        else{
            fn(true);
        }
        return;
    });
};

Search.prototype.indexForPrefixSearch = function(id, name, sortedKey, setKey, fn){
    var lowerName = name.toLowerCase();

    var multi = this.client.multi();
    multi.zadd(REDISKEY[sortedKey], 0, lowerName + '*');
    for(var i = 1, length = lowerName.length; i < length; i++){
        multi.zadd(REDISKEY[sortedKey], 0, lowerName.substring(0,i));
    }

    multi.sadd(REDISKEY[setKey] + lowerName, id);

    multi.exec(function(err, reply){
        if(isDebug){
            console.log('add index: ' + name);
            console.log('err: ', err);
            console.log('zadd index*: ', reply[0]);
        }
        if(err){
            log.error('Error when indexForPrefixSearch : ' + name);
            fn(false);
        }
        else{
            log.info('Succeed in indexForPrefixSearch : ' + name);
            fn(true);
        }
    });
};

Search.prototype.indexForSegmentSearch = function(id, name, prefix, fn){
    var lowerName = name.toLowerCase();
    var splitParts = split(lowerName);
    var filterParts = filter(splitParts);
    if(isDebug){
        console.log('segment: ' + JSON.stringify(splitParts));
        console.log('filter : ' + JSON.stringify(filterParts));
    }

    var pKey = REDISKEY[prefix];
    var multi = this.client.multi();
    for(var i = 0, length = filterParts.length; i < length; i++){
        multi.zadd(pKey + filterParts[i], id, id);
    }

    multi.exec(function(err, reply){
        if(isDebug){
            console.log('err: ', err);
            console.log('origin : ' + name);
        }
        if(err){
            log.error('Error when indexForSegmentSearch [' + pKey + '] : ' + name);
            fn(false);
        }
        else{
            log.info('Succeed in indexForSegmentSearch [' + pKey + '] : ' + name);
            fn(true);
        }
    });
};

Search.prototype.removeForSegmentSearch = function(id, name, prefix, fn){
    var lowerName = name.toLowerCase();
    var splitParts = split(lowerName);
    var filterParts = filter(splitParts);
    if(isDebug){
        console.log('segment: ' + splitParts);
        console.log('filter : ' + filterParts);
    }

    var pKey = REDISKEY[prefix];
    var multi = this.client.multi();
    for(var i = 0, length = filterParts.length; i < length; i++){
        multi.zrem(pKey + filterParts[i], id);
    }

    multi.exec(function(err, reply){
        if(isDebug){
            console.log('err: ', err);
            console.log('origin : ' + name);
        }
        if(err){
            log.error('Error when removeForSegmentSearch [' + pKey + '] : ' + name);
            fn(false);
        }
        else{
            log.info('Succeed in removeForSegmentSearch [' + pKey + '] : ' + name);
            fn(true);
        }
    });
};

Search.prototype.removeForPrefixSearch = function(id, name, sortedKey, setKey, fn){
    var lowerName = name.toLowerCase();

    var multi = this.client.multi();
    multi.zrem(REDISKEY[sortedKey], lowerName + '*');
    multi.srem(REDISKEY[setKey] + lowerName, id);
    multi.exec(function(err, reply){
        if(isDebug){
            console.log('err: ', err);
            console.log('origin : ' + name);
        }
        if(err){
            log.error('Error when removeForPrefixSearch : ' + name);
            fn(false);
        }
        else{
            log.info('Succeed in removeForPrefixSearch : ' + name);
            fn(true);
        }
    });
};

Search.prototype.queryForSegmentSearch = function(queryStr, pageNo, pageSize, prefix, fn){
    var start = pageSize * (pageNo -1);
    var stop = parseInt(start) + parseInt(pageSize) - 1;
    var pKey = REDISKEY[prefix];
    var client = this.client;
    client.zcard(pKey + queryStr, function(err, reply){
        if(err || reply === 0){
            fn({flag:true, totalCount:0, data:[]});
        }
        else{
            client.zrange(pKey + queryStr, start, stop, function(err, replies){
                if(err || !replies || replies.length == 0){
                    fn({flag:true, totalCount:reply, data:[]});
                }
                else{
                    fn({flag:true, totalCount:reply, data:replies});
                }
            });
        }
    });
};

Search.prototype.queryForPrefixSearch = function(queryStr, sortedKey, setKey, dataKey, fn){
    var client = this.client;
    var multi = client.multi();
    client.zrank(REDISKEY[sortedKey], queryStr+'*', function(err,reply){
        if(isDebug){
            console.log('zrank ['+queryStr+'*], zrank result:', reply);
        }
        if(reply !== null && reply >= 0){//说明存在真实值queryStr
            getData(client, queryStr, sortedKey, setKey, dataKey, reply, fn);
        }
        else{
            if(isDebug){
                console.log('zrank ['+queryStr+'*], 没查到, 开始直接 zrank ['+queryStr+'], 然后query');
            }
            client.zrank(REDISKEY[sortedKey], queryStr, function(err, reply){
                if(reply !== null && reply >= 0){
                    getData(client, queryStr, sortedKey, setKey, dataKey, reply, fn);
                }
                else{
                    fn([]);
                }
            });
        }
    });
};



// ~ ======================================================

function getData(client, queryStr, sortedKey, setKey, dataKey, reply, fn){
    client.zrange(REDISKEY[sortedKey], reply, reply + step, function(err, rangeKeys){
        if(!err && rangeKeys && rangeKeys.length > 0){
            var keys = [];
            rangeKeys.forEach(function(key){
                var keylen = key.length;
                if(( key.indexOf(queryStr) === 0 ) && (key.substring(keylen - 1,keylen) === '*')){
                    if((keylen - 1) >= queryStr.length){
                         keys.push(REDISKEY[setKey] + key.substring(0,keylen-1));
                    }
                }
            });

            if(keys.length > 0){
                client.sunion(keys, function(err, ids){
                    if(data_store_enable){
                        client.hmget(REDISKEY[dataKey], ids, function(err, results){
                            if(!err && results && results.length > 0){
                                var data = [];
                                for(var k = 0, keyLength = ids.length; k < keyLength; k++){
                                    data[k] = {'id': ids[k], 'value': results[k]};
                                }
                                fn(data || []);
                            }
                            else{
                                fn([]);
                            }
                        });
                    }
                    else{
                        fn(ids || []);
                    }
                    
                });
            }
            else{
                fn([]);
            }
        }
        else{
            fn([]);
        }
    });
}

function split(text){
    if(!text || typeof text !== 'string' || text.length == 0){
        return [];
    }
    var ret = [];
    for(var i = 0, len = text.length; i < len; i++){
        ret.push(text[i]);
        for(var step = 2; step <= 5; step++){
            if( i + step <= len){
                ret.push(text.substring(i, i + step));   
            }
        }
    }
    return ret;
}

function filter(parts){
    if(!parts || !Array.isArray(parts) || parts.length == 0) {
        return [];
    }
    var ret = [];
    for (var i in parts){
        var flag = true;
        for(var j in stopWords){
           if(parts[i].indexOf(stopWords[j]) !== -1) {
                flag = false;
                break;
            }
        }
        if(flag){
            ret.push(parts[i]);
        }
    }
    return ret;
}
