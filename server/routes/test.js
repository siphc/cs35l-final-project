const router = require('express').Router();

// Drop the entire table if you touch /api/tests/reset-db under e2e
if (process.env.NODE_ENV === 'e2e') {
  const Assignment = require('../models/assignment');
  const Chat = require('../models/chat')
  const Class = require('../models/class');
  const Event = require('../models/event');
  const Grade = require('../models/grade');
  const Message = require('../models/message');
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