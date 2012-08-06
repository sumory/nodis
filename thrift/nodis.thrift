struct User {
  1: i64 uid,
  2: string name,
  3: string info
}

struct Group {
  1: i64 gid,
  2: string name,
  3: string info
}

service Nodis {
  string createUserIndex(1: User user)
  string modifyUserIndex(1: User oldUser, 2: User newUser)
  string queryUserPage(1: string queryStr, 2: i32 pageNo, 3: i32 pageSize)

  string createGroupIndex(1: Group group)
  string modifyGroupIndex(1: Group oldGroup, 2: Group newGroup)
  string queryGroupPage(1: string queryStr, 2: i32 pageNo, 3: i32 pageSize)

  string queryPrefixUserPage(1: string queryStr)
}
