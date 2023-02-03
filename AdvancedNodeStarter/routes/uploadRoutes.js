const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');
const keys = require('../config/keys');

AWS.config.update({
  region: "ap-south-1",
  "accessKeyId": keys.accessKeyId,
  "secretAccessKey": keys.secretAccessKey
});

const s3 = new AWS.S3(
  // {
  //   accessKeyId: keys.accessKeyId,
  //   secretAccessKey: keys.secretAccessKey
  // }
);

// operation name to upload a file 'putObject'
module.exports = app => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;
    s3.getSignedUrl('putObject', {
      Bucket: 'my-blogster-bucket-1234',
      ContentType: 'image/jpeg',
      Key: key
    }, (err, url) => res.send({ key, url }));
  });
};