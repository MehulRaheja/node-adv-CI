const mongoose = require('mongoose');
const util = require('util');

// redis client setup
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec; // to keep original function safe

// don't use arrow function it will mess with the this keyword pointing object
mongoose.Query.prototype.exec = async function () {
  // console.log(this.getQuery());   // to get whole query in JSON format
  // console.log(this.mongooseCollection.name);  // to get the name of collection on which mongoose query has been run

  // to copy one object data to the other safely and don't modify the original object
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // See if we have a value for 'key' in redis
  const cacheValue = await client.get(key);

  //  If we do, return that
  if (cacheValue) {
    // console.log(cacheValue);
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
  client.set(key, JSON.stringify(result));

  return result;
}