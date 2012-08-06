exports.config = {
	name : 'Nodis',
	description : 'Prefix match search and Segment words search built on Node.js and Redis.',
	nodis_thrift_service_ip : '192.168.1.126',
	nodis_thrift_service_port : '9998',
	nodis_debug : true,
	prefix_match_enable : true,
	data_store_enable : false,

	// redis config
	redis_server : 'localhost',
	redis_port : 6379,
	redis_debug_mode : false, //print node-redis log or not
	redis_key : {
	    'userSegmentSrchIndex' : 'uidx_',
	    'groupSegmentSrchIndex' : 'gidx_',
	    'userPSrchSortedIndex' : 'upsortidx',
	    'userPSrchSetIndex' : 'upsetidx_',
	    'userData' : 'udata',
	    'groupData' : 'gdata'
	},

	zk_hosts : '192.168.1.118:2181,192.168.1.118:2182,192.168.1.118:2183',

	prefix_search_step : 1000,

	// some limit
	max_username_length : 8,
	max_groupname_length : 15,
};