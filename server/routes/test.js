const router = require('express').Router();

// Drop the entire table if you touch /api/tests/reset-db under e2e
if (process.env.NODE_ENV === 'e2e') {
  const Assignment = require('../models/Assignment');
  const Chat = require('../models/Chat')
  const Class = require('../models/class');
  const Event = require('../models/Event');
  const Grade = require('../models/Grade');
  const Message = require('../models/Message');
  const Session = require('../models/session');
  const User = require('../models/user');

  router.post('/reset-db', async (req, res) => {
    await Promise.all([
      Chat.deleteMany({}),
      Class.deleteMany({}),
      Event.deleteMany({}),
      Assignment.deleteMany({}),
      Grade.deleteMany({}),
      Message.deleteMany({}),
      Session.deleteMany({}),
      User.deleteMany({}),
    ]);
    res.json({ ok: true });
  });
}

module.exports = router;