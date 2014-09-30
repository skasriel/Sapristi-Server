var redis = require("redis");
var client;

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  client = redis.createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
    client = require("redis").createClient();
}
redis.client = client;

module.exports = redis;
module.exports.client = client;
