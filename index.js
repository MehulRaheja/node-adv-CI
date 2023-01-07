  const express = require('express');
  const crypto = require('crypto');
const app = express();

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
