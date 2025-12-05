const router = require('express').Router();

// Drop the entire table if you touch /api/tests/reset-db under e2e
if (process.env.NODE_ENV === 'e2e') {
  const User = require('../models/user');
  const Session = require('../models/session');
  const Class = require('../models/class');
  const Assignment = require('../models/Assignment');
  const Grade = require('../models/Grade');

  router.post('/reset-db', async (req, res) => {
    await Promise.all([
      User.deleteMany({}),
      Session.deleteMany({}),
      Class.deleteMany({}),
      Assignment.deleteMany({}),
      Grade.deleteMany({},)
    ]);
    res.json({ ok: true });
  });
}

module.exports = router;