const Queue = require('bull')
require('dotenv').config()

// URLs
const redisHOST = process.env.REDIS_HOST
const redisPORT = process.env.REDIS_PORT

// Queue
var queue = null
exports.getQueue = () => queue

//----------------------------------------------------------------//
exports.connectToRedis = async () => {
  if (queue) await queue.close()
  queue = new Queue('api', {
    redis: {
      port: redisPORT,
      host: redisHOST,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    }
  })
  return queue.isReady()
}

exports.getRedisState = async () => {
  try {
    var result = await queue.isReady()
    var redisStatus = result.clients[0].status
    return redisStatus === 'ready' ? 'ACTIVE' : 'DISCONNECTED'
  } catch (error) {
    return 'DISCONNECTED'
  }
}
