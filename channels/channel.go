package channels

import "github.com/ashuthe1/streamx/models"

var BroadcastKafkaNotification = make(chan *models.Notification)

var BroadcastKafkaActivity = make(chan *models.ActivityEvent)

var Broadcast_S3_FileURL = make(chan string)
