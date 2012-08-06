var http = require('http');
var express = require('express');
var partials = require('express-partials');
var app = express();
var search = require('./lib/nodis.js').createSearch();

app.configure(function(){
    app.set('port', process.env.PORT || 9999);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('nodis'));
    app.use(partials());
    app.use(app.router);
});

app.configure('development', function() {
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler());
});

app.configure('production', function() {
    var time = 1000 * 60 * 60 * 24 * 30;
    app.use(express.static(__dirname + '/public', {
        maxAge : time
    }));
    app.use(express.errorHandler());
    app.set('view cache', true);
});

app.locals({
    title : 'nodis monitor',
    author : 'sumory.wu'
});

app.get('/', function(req, res){
    res.render('index');
});

app.get('/queryPrefixUserPage', function(req, res){
    var queryStr = req.query.q;
    if(queryStr){
        queryStr = queryStr.replace(/^\"|\"$/g,'').replace(/^\'|\'$/g,'').replace(/^\s*|\s*$/g,'');
    }
    else{
        res.json({flag:false});
        return;
    }
    
    console.log('To search: ' + queryStr);

    if(!queryStr || queryStr.length == 0 || queryStr.length >= 12 || queryStr.indexOf(' ') != -1){
         console.log('输入的查询参数不符合规则: ', queryStr);
         res.json({flag:false});
         return;
    }
    else{
        var t1= Date.now();
        search.queryForPrefixSearch(queryStr, 'userPSrchSortedIndex', 'userPSrchSetIndex','userData', function(results){
            console.log('cost(ms):', Date.now()-t1);
            console.log('Search results: "%s"', JSON.stringify(results));
            res.json({flag:true, data:results});
            return;   
        });
    }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Nodis is listening on port %d in %s mode", app.get('port'), app.get('env'));
});



