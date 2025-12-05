const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');
const Class = require('../models/class');
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check if two arrays contain the same elements (order doesn't matter)
const arraysHaveSameElements = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].map(id => id.toString()).sort();
  const sorted2 = [...arr2].map(id => id.toString()).sort();
  return sorted1.every((val, index) => val === sorted2[index]);
};

// Create a new chat or return existing one (duplicate prevention)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { classId, participantIds, isGroupChat, name } = req.body;
    const currentUserId = req.user._id.toString();

    // Validate required fields
    if (!classId || !participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({
        success: false,
        message: 'classId and participantIds array are required',
      });
    }

    // Ensure current user is included in participants
    const allParticipants = [...new Set([currentUserId, ...participantIds])];

    // Validate that all participants are in the class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    // Check if current user is a member of the class
    const isCreator = classData.creator.toString() === currentUserId;
    const isMember = classData.members.some(
      (memberId) => memberId.toString() === currentUserId
    );

    if (!isCreator && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this class',
      });
    }

    // Validate all participants are in the class
    for (const participantId of allParticipants) {
      const isParticipantCreator = classData.creator.toString() === participantId;
      const isParticipantMember = classData.members.some(
        (memberId) => memberId.toString() === participantId
      );

      if (!isParticipantCreator && !isParticipantMember) {
        return res.status(400).json({
          success: false,
          message: 'All participants must be members of the class',
        });
      }
    }

    // Check for duplicate chats
    // For direct chats: Find chats with exactly the same 2 participants
    // For group chats: Find chats with exactly the same set of participants
    const existingChats = await Chat.find({
      classId: classId,
      isGroupChat: isGroupChat || allParticipants.length > 2,
    });

    const duplicateChat = existingChats.find((chat) =>
      arraysHaveSameElements(chat.participants, allParticipants)
    );

    if (duplicateChat) {
      // Return the existing chat instead of creating a duplicate
      const populatedChat = await Chat.findById(duplicateChat._id)
        .populate('participants', 'email displayName')
        .populate('classId', 'name');

      return res.status(200).json({
        success: true,
        message: 'Chat already exists',
        data: {
          chat: populatedChat,
          isNew: false,
        },
      });
    }

    // Create new chat
    const newChat = new Chat({
      classId,
      participants: allParticipants,
      isGroupChat: isGroupChat || allParticipants.length > 2,
      name: isGroupChat || allParticipants.length > 2 ? name || 'Group Chat' : '',
    });

    await newChat.save();

    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'email displayName')
      .populate('classId', 'name');

    return res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: {
        chat: populatedChat,
        isNew: true,
      },
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Add members to an existing chat (with duplicate prevention)
router.post('/:chatId/add-members', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { participantIds } = req.body;
    const currentUserId = req.user._id.toString();

    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({
        success: false,
        message: 'participantIds array is required',
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify current user is a participant
    if (!chat.participants.some((p) => p.toString() === currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat',
      });
    }

    // Get the class data
    const classData = await Class.findById(chat.classId);
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Associated class not found',
      });
    }

    // Validate all new participants are in the class
    for (const participantId of participantIds) {
      const isParticipantCreator = classData.creator.toString() === participantId;
      const isParticipantMember = classData.members.some(
        (memberId) => memberId.toString() === participantId
      );

      if (!isParticipantCreator && !isParticipantMember) {
        return res.status(400).json({
          success: false,
          message: 'All participants must be members of the class',
        });
      }
    }

    // Check if adding these members would create a duplicate of another existing chat
    const updatedParticipants = [
      ...new Set([...chat.participants.map((p) => p.toString()), ...participantIds]),
    ];

    const existingChats = await Chat.find({
      classId: chat.classId,
      _id: { $ne: chatId }, // Exclude current chat
    });

    const duplicateChat = existingChats.find((existingChat) =>
      arraysHaveSameElements(existingChat.participants, updatedParticipants)
    );

    if (duplicateChat) {
      return res.status(400).json({
        success: false,
        message: 'A chat with these participants already exists',
        data: {
          existingChatId: duplicateChat._id,
        },
      });
    }

    // Add new participants (avoid duplicates)
    chat.participants = updatedParticipants;
    chat.isGroupChat = chat.participants.length > 2;
    await chat.save();

    const populatedChat = await Chat.findById(chatId)
      .populate('participants', 'email displayName')
      .populate('classId', 'name');

    return res.status(200).json({
      success: true,
      message: 'Members added successfully',
      data: {
        chat: populatedChat,
      },
    });
  } catch (error) {
    console.error('Error adding members:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get all chats for the current user (optionally filtered by class)
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const { classId } = req.query;

    const query = {
      participants: currentUserId,
    };

    if (classId) {
      query.classId = classId;
    }

    const chats = await Chat.find(query)
      .populate('participants', 'email displayName')
      .populate('classId', 'name')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        chats,
      },
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id.toString();
    const { limit = 50, offset = 0 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify current user is a participant
    if (!chat.participants.some((p) => p.toString() === currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat',
      });
    }

    const messages = await Message.find({ chatId })
      .populate('sender', 'email displayName')
      .sort({ createdAt: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: {
        messages,
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Send a message to a chat
router.post('/:chatId/send', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user._id.toString();

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify current user is a participant
    if (!chat.participants.some((p) => p.toString() === currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat',
      });
    }

    // Create new message
    const newMessage = new Message({
      chatId,
      sender: currentUserId,
      content: content.trim(),
    });

    await newMessage.save();

    // Update chat's lastMessageAt
    chat.lastMessageAt = new Date();
    await chat.save();

    const populatedMessage = await Message.findById(newMessage._id).populate(
      'sender',
      'email displayName'
    );

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get details of a specific chat
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id.toString();

    const chat = await Chat.findById(chatId)
      .populate('participants', 'email displayName')
      .populate('classId', 'name');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify current user is a participant
    if (!chat.participants.some((p) => p._id.toString() === currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        chat,
      },
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Delete a chat
router.delete('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user._id.toString();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    // Verify current user is a participant
    if (!chat.participants.some((p) => p.toString() === currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat',
      });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    return res.status(200).json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;
