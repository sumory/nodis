## Nodis

**Nodis** - 通用文本前缀匹配搜索和模糊搜索服务程序，基于Node.js和Redis.
  
### 使用

 - 使用Zookeeper和Thrift:

	```
	 - 启动redis
	 - 启动服务端node NodisServer.js(会注册zookeeper服务)
	 - 根据thrift/nodis.thrift提供的接口实现客户端(或直接用/thrift/gen-nodejs里生成的客户端代码)
	 - 通过zookeeper拿到服务地址，并通过thrift客户端调用接口测试
	```

 - 直接使用Nodis, 示例`Nodis.js`

 
### 其它

 - 前缀匹配搜索(如User), 提供了app.js用作web端参考实现