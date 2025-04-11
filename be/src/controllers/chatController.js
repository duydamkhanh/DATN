const mongoose = require('mongoose');
const Message = require('../models/message');

const createMessage = async (req, res) => {
    const { message, userId } = req.body;

    // Kiểm tra nếu message hoặc userId không có giá trị
    if (!message || !userId) {
        return res.status(400).json({ error: "Message and userId are required" });
    }

    try {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const userMessage = new Message({
            text: message,
            sender: 'user',
            receiver: 'admin',
            userId: userObjectId
        });
        await userMessage.save();
        return res.status(201).json({
            userMessage,  
        });
    } catch (error) {
        console.error("Error saving message:", error);
        // Trả về phản hồi lỗi nếu có
        return res.status(500).json({
            error: "Failed to save message",
            details: error.message,
        });
    }
};

const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().populate('userId'); // Lấy toàn bộ tin nhắn
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const getMessagesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.find({ userId: userId }).sort({ timestamp: 1 }); // Lấy tin nhắn theo userId, sắp xếp theo thời gian
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages by userId:", error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

const replyToMessage = async (req, res) => {
    const { userId, replyText } = req.body;

    if (!userId || !replyText) {
        return res.status(400).json({ error: 'userId and replyText are required' });
    }

    try {
        const replyMessage = new Message({
            text: replyText,
            sender: 'admin',
            receiver: 'user',
            userId: userId,
        });

        await replyMessage.save();
        res.status(201).json({ message: 'Reply sent successfully', replyMessage });
    } catch (error) {
        console.error("Error replying to message:", error);
        res.status(500).json({ error: 'Failed to send reply', details: error.message });
    }
};

module.exports = {
    getMessagesByUserId,
    createMessage,
    getAllMessages,
    replyToMessage
};
