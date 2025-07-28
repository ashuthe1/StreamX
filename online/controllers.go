package online

import (
	"context"

	"github.com/ashuthe1/streamx/internal/redisclient"
)

const onlineUserKey = "online_users"

func AddUserToRedis(username string) error {
	res := redisclient.Client.SAdd(context.Background(), onlineUserKey, username)
	return res.Err()
}

func DeleteUserFromRedis(username string) error {
	res := redisclient.Client.SRem(context.Background(), onlineUserKey, username)
	return res.Err()
}

func IsUserOnline(username string) bool {
	return redisclient.Client.SIsMember(context.Background(), onlineUserKey, username).Val()
}

func GetTotalOnlineUsers() int {
	return len(redisclient.Client.SMembers(context.Background(), onlineUserKey).Val())
}
