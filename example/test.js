
var search = require('../lib/nodis.js').createSearch();
console.log(Date.now());
//search.index(12, '北京大学这妞好靓sumory', 'userIndexPrefix', function(){process.exit();});
//search.index(13, '北京大学这妞好靓sumory', 'userIndexPrefix', function(){process.exit();});
//search.remove(12, '北京大学这妞好靓sumory', 'userIndexPrefix', function(){process.exit();});

//search.query('s', 2, 20, 'userIndexPrefix', function(result){console.log(JSON.stringify(result));process.exit();});

function testPrefixSearch(){
	search.indexForPrefixSearch(1, 'sumory', 'userPSrchSortedIndex', 'userPSrchSetIndex', function(isOk){
		if(isOk){
			search.putHashData(1, 'sfdfdsfsdfd', 'userData', function(right){
				if(right){
					search.queryForPrefixSearch('sum', 'userPSrchSortedIndex', 'userPSrchSetIndex','userData', function(results){
						console.log(results);
						process.exit();
					});
				}
				else{
					console.log('hash error');
					process.exit();
				}
			});
		}
		else{
			console.log('error error error ');
			process.exit();
		}
	});
}

testPrefixSearch();
