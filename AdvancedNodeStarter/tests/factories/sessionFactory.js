const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      user: user._id.toString()
    }
  };

  // convert sessionObject into string and then into base64 string
  const session = Buffer.from(
    JSON.stringify(sessionObject)
  ).toString('base64');

  const sig = keygrip.sign('session=' + session); // generating session signature from keygrip

  return { session, sig };
};