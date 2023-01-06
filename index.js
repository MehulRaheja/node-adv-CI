process.env.UV_THREADPOOL_SIZE = 1;
// instead of default 4 threads, now each fork child will have 1 thread
const cluster = require('cluster');

// console.log(cluster.isMaster);
//Is the file being executed in master mode?
if (cluster.isMaster) {
  // cause index.js to be executed *again* but
  // in child mode
  cluster.fork();
  cluster.fork();
  cluster.fork();
  cluster.fork();
} else {
  // I'm a child, I'm going to act like a server
  // and do nothing else
  const express = require('express');
  const crypto = require('crypto');
  const app = express();
  // console.log('here');

  // function doWork(duration) {
  //   const start = Date.now();
  //   while (Date.now() - start < duration) { }
  // }

  app.get('/', (req, res) => {
    crypto.pbkdf2('a', 'b', 100000, 512, 'sha512', () => {
      res.send('This is slow');
    });

  });

  app.get('/fast', (req, res) => {
    // doWork(5000);
    res.send('This is fast');
  });


  app.listen(3000);
}