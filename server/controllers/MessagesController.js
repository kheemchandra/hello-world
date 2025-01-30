import Message from "../models/MessagesModel.js";
import { mkdirSync, renameSync } from "fs";
export const getMessages = async (req, res, next) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    if (!user1 || !user2) {
      return res.status(400).send("Both user IDs are required");
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const uploadFile = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required");
    }
    const date = Date.now();

    let fileDir = `uploads/files/${date}`;

    let fileName = `${fileDir}/${request.file.originalname}`;

    mkdirSync(fileDir, { recursive: true });

    renameSync(request.file.path, fileName);
    return response.status(200).json({ filePath: fileName });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

// server/controllers/MessagesController.js

export const addReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).send("Message not found");
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (reaction) =>
        reaction.userId.toString() === userId && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if it exists (toggle behavior)
      message.reactions = message.reactions.filter(
        (reaction) =>
          !(reaction.userId.toString() === userId && reaction.emoji === emoji)
      );
    } else {
      // Add new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Emit socket event
    // Will implement in socket.js

    return res.status(200).json({ message });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

// We actually don't need a separate remove endpoint since toggle is handled in add
export const removeReaction = async () => {};
