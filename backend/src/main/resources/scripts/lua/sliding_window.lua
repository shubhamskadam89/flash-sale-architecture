local key = KEYS[1]
local windowStart = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local member = ARGV[3]
local limit = tonumber(ARGV[4])
local expireSeconds = tonumber(ARGV[5])

redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
redis.call('ZADD', key, now, member)
local currentCount = redis.call('ZCARD', key)
redis.call('EXPIRE', key, expireSeconds)

local allowed = 0
if currentCount <= limit then
    allowed = 1
end

return {allowed, currentCount}
