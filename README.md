## Nodis

  Nodis - Prefix match search and Segment words search built on Node.js and Redis.
  
  使用了zookeeper和thrift, 客户端可用任何支持thrift的语言实现, 也可以很容易的去除这两部分.

  
### 使用

 - 启动redis
 - 启动服务端node NodisServer.js(会注册zookeeper服务)
 - 根据thrift/nodis.thrift提供的接口实现客户端(或直接用/thrift/gen-nodejs里生成的客户端代码)
 - 通过zookeeper拿到服务地址，并通过thrift客户端调用接口测试
 
### 其它

 - zookeeper的代码可以很容易的移除, 代码在/lib/zk.js
 - 核心库只有nodis.js, 不使用thrift只需要更改/NodisServer.js
 - 前缀匹配搜索(如User), 提供了app.js用作参考实现