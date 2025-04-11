const express = require('express');
const { createMessage, getAllMessages, getMessagesByUserId, replyToMessage } = require('../controllers/chatController');
const router = express.Router();


router.post('/chat', createMessage);
router.post('/chatRep', replyToMessage);
router.get('/messages', getAllMessages);
router.get('/messages/user/:userId', getMessagesByUserId);
module.exports = router;
