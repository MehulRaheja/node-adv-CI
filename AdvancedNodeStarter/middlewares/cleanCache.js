const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => { // this function will work as middleware
    await next(); // it will allow route handler to run first and then we will return to it.

    clearHash(req.user.id); // after the query has ran then we will clear the hash.
};