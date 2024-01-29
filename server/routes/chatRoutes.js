const express = require("express");
const router = express.Router();
const ChatModel = require("../models/messageM");
const userModel = require("../models/userModel");

router.get("/user/", async (req, res) => {
  const otherUserId = req.query.user;
  const currentUserId = req.query.loggeduserid;

  try {
    const existingChat = await ChatModel.findOne({
      users_id: { $all: [currentUserId, otherUserId] }, // Updated to use 'users_id' instead of 'userIds'
    });

    if (existingChat) {
      return res.json({ chatId: existingChat.chat_id });
    } else {
      const newChat = new ChatModel({
        users_id: [otherUserId, currentUserId],
      });

      await newChat.save();

      return res.json({ chatId: newChat.chat_id });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/allchats", async (req, res) => {
  try {
    const loggedUserId = req.query.loggeduserid;

    const chats = await ChatModel.find({ users_id: loggedUserId });

    const chatData = chats.map((chat) => ({
      chat_id: chat.chat_id,
      other_user_id: chat.users_id.find((id) => id !== loggedUserId),
    }));

    res.status(200).json(chatData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
