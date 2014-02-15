var search = require('./lib/nodis.js').createSearch();
var config = require('./config.js').config;
var prefix_match_enable = config.prefix_match_enable;
var data_store_enable = config.data_store_enable;

var createUserIndex = function(user, fn){
    var buf = new Buffer(user.name, 'ascii');
    var name = buf.toString('utf8');
    var id = user.uid;

    if(name){
        name = name.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('error:illegal param1');
        return;
    }

    if(!name || name.length == 0 || name.length > config.max_username_length || name.indexOf(' ') != -1){
        fn('error:illegal param2');
        return;
    }
    else{
        search.indexForSegmentSearch(id, name, 'userSegmentSrchIndex', function(result){
            if(result){
                if(prefix_match_enable){
                    search.indexForPrefixSearch(id, name, 'userPSrchSortedIndex', 'userPSrchSetIndex', function(isOk){
                        if(data_store_enable){
                            search.putHashData(id, new Buffer(user.info, 'ascii').toString('utf8'), 'userData', function(hashOk){
                            });
                        }
                    });
                }
                fn('success');
            }
            else{
                fn('error:index error');
            }
            return;
        });
    }
};

var createGroupIndex = function(group, fn){
    var buf = new Buffer(group.name, 'ascii');
    var name = buf.toString('utf8');
    var id = group.gid;

    if(name){
        name = name.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('error:illegal param');
        return;
    }

    if(!name || name.length == 0 || name.length > config.max_groupname_length || name.indexOf(' ') != -1){
        fn('error:illegal param');
        return;
    }
    else{
        search.indexForSegmentSearch(id, name, 'groupSegmentSrchIndex', function(result){
            if(result){
                fn('success');
            }
            else{
                fn('error:index error');
            }
            return;
        });
    }
};

var modifyUserIndex = function(oldUser, newUser, fn){
    var buf = new Buffer(oldUser.name, 'ascii');
    var oldName = buf.toString('utf8');
    var oldId = oldUser.uid;

    if(oldName){
        oldName = oldName.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('error:illegal param1');
        return;
    }

    if(!oldName || oldName.length == 0 || oldName.length > config.max_username_length || oldName.indexOf(' ') != -1){
        fn('error:illegal param2');
        return;
    }

    var buf2 = new Buffer(newUser.name, 'ascii');
    var newName = buf2.toString('utf8');
    var newId = newUser.uid;

    if(newName){
        newName = newName.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('error:illegal param3');
        return;
    }

    if(!newName || newName.length == 0 || newName.length > config.max_username_length || newName.indexOf(' ') != -1){
        fn('error:illegal param4');
        return;
    }

    search.removeForSegmentSearch(oldId, oldName, 'userSegmentSrchIndex', function(result){
        if(result){
            search.indexForSegmentSearch(newId, newName, 'userSegmentSrchIndex', function(result){
                if(result){
                    if(prefix_match_enable){
                        search.removeForPrefixSearch(oldId, oldName, 'userPSrchSortedIndex', 'userPSrchSetIndex', function(removeOk){
                            search.indexForPrefixSearch(newId, newName, 'userPSrchSortedIndex', 'userPSrchSetIndex', function(isOk){
                                if(data_store_enable){
                                    search.putHashData(id, new Buffer(newUser.info, 'ascii').toString('utf8'), 'userData', function(hashOk){
                                    });
                                }

                            });
                        });
                    }
                    fn('success');
                }
                else{
                    fn('error:index error');
                }
                return;
            });
        }
        else{
            fn('error:remove index error');
            return;
        }
    });
};

var modifyGroupIndex = function(oldGroup, newGroup, fn){
    var buf = new Buffer(oldGroup.name, 'ascii');
    var oldName = buf.toString('utf8');
    var oldId = oldGroup.gid;

    if(oldName){
        oldName = oldName.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('error:illegal param1');
        return;
    }

    if(!oldName || oldName.length == 0 || oldName.length > config.max_groupname_length || oldName.indexOf(' ') != -1){
        fn('error:illegal param2');
        return;
    }

    var buf2 = new Buffer(newGroup.name, 'ascii');
    var newName = buf2.toString('utf8');
    var newId = newGroup.gid;

    if(newName){
        newName = newName.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('error:illegal param3');
        return;
    }

    if(!newName || newName.length == 0 || newName.length > config.max_groupname_length || newName.indexOf(' ') != -1){
        fn('error:illegal param4');
        return;
    }

    search.removeForSegmentSearch(oldId, oldName, 'groupSegmentSrchIndex', function(result){
        if(result){
            search.indexForSegmentSearch(newId, newName, 'groupSegmentSrchIndex', function(result){
                if(result){
                    fn('success');
                }
                else{
                    fn('error:index error');
                }
                return;
            });
        }
        else{
            fn('error:remove index error');
            return;
        }
    });
};

var queryUserPage = function(queryStr, pageNo, pageSize, fn){
    var buf = new Buffer(queryStr, 'ascii');
    queryStr = buf.toString('utf8');

    if(queryStr){
        queryStr = queryStr.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('{"flag":false,"data":"param format error1"}');
        return;
    }
    if(!queryStr || queryStr.length == 0 || queryStr.length > config.max_username_length || queryStr.indexOf(' ') != -1){
        fn('{"flag":false,"data":"param format error2"}');
        return;
    }
    else{
        var t1= Date.now();
        search.queryForSegmentSearch(queryStr, pageNo, pageSize, 'userSegmentSrchIndex', function(result){
            console.log('cost(ms):', Date.now()-t1);
            console.log('Search results for "%s"', result);

            fn(JSON.stringify(result));
            return;   
        });
    }
};

var queryGroupPage = function(queryStr, pageNo, pageSize, fn){
    var buf = new Buffer(queryStr, 'ascii');
    queryStr = buf.toString('utf8');
    if(queryStr){
        queryStr = queryStr.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('{"flag":false,"data":"param format error1"}');
        return;
    }

    if(!queryStr || queryStr.length == 0 || queryStr.length > config.max_groupname_length || queryStr.indexOf(' ') != -1){
        fn('{"flag":false,"data":"param format error2"}');
        return;
    }
    else{
        var t1= Date.now();
        search.queryForSegmentSearch(queryStr, pageNo, pageSize, 'groupSegmentSrchIndex', function(result){
            console.log('cost(ms):', Date.now()-t1);
            console.log('Search results for "%s"', result);

            fn(JSON.stringify(result));
            return;   
        });
    }
};

var queryPrefixUserPage = function(queryStr, fn){
    var buf = new Buffer(queryStr, 'ascii');
    queryStr = buf.toString('utf8');

    if(queryStr){
        queryStr = queryStr.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        fn('{"flag":false,"data":"param format error1"}');
        return;
    }
    if(!queryStr || queryStr.length == 0 || queryStr.length > config.max_username_length || queryStr.indexOf(' ') != -1){
        fn('{"flag":false,"data":"param format error2"}');
        return;
    }
    else{
        var t1= Date.now();
        search.queryForPrefixSearch(queryStr, 'userPSrchSortedIndex', 'userPSrchSetIndex','userData', function(results){
            console.log('cost(ms):', Date.now()-t1);
            console.log('Search results for "%s"', results);
            fn('{"flag":true,"data":' + JSON.stringify(results) +'}');
            return;   
        });
    }
};


module.exports = {
    createUserIndex : createUserIndex,
    modifyUserIndex : modifyUserIndex,
    queryUserPage : queryUserPage,

    createGroupIndex : createGroupIndex,
    modifyGroupIndex : modifyGroupIndex,
    queryGroupPage : queryGroupPage,

    queryPrefixUserPage : queryPrefixUserPage
};

