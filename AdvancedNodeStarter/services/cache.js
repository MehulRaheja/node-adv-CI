const mongoose = require('mongoose');
const util = require('util');
const keys = require('../config/keys');

// redis client setup
const redis = require('redis');

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);   // hget command is used to get the value associated with the field in the hash stored at the key

const exec = mongoose.Query.prototype.exec; // to keep original function safe

// to create toggle cache, means to use cache only for selected api
// only use below type of function not arrow function, it will mess with this keyword
// for this we will assign a cache function to the query, which will help to use cache for a particular api
mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');  // to apply forced expiration on change of data
  return this;
}

// don't use arrow function it will mess with the this keyword pointing object
mongoose.Query.prototype.exec = async function () {
  // when .cache() is not called we will access the database right away
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  // console.log(this.getQuery());   // to get whole query in JSON format
  // console.log(this.mongooseCollection.name);  // to get the name of collection on which mongoose query has been run

  // to copy one object data to the other safely and don't modify the original object
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  //  If we do, return that
  if (cacheValue) {
    console.log(cacheValue);
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc)  // convert object to mongodb model using model class

    // it should return a mongodb document/ mongoose model

  }

  // Otherwise, issue the query and store the result in redis


  const result = await exec.apply(this, arguments);

  //result is function not an mongoose/mongodb object
  // we need to convert it into object before storing inside redis
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10); // 3rd and 4th argument will expire the cache in 10 seconds

  return result;
}


// To forcibly clear cache
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));  // to clear cache related to a particular hash
  }
};