import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createMessage = await Message.create(message);

    const messageData = await Message.findById(createMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("recieveMessage", messageData);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();
    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });
    const channel = await Channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel && channel.members) {
      channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("recieve-channel-message", finalData);
        }
      });
      const adminSocketId = userSocketMap.get(channel.admin._id.toString());

      if (adminSocketId) {
        io.to(adminSocketId).emit("recieve-channel-message", finalData);
      }
    }
  };

  const handleTyping = async (data) => {
    // Make this async
    const { chatId, userId, username, isChannel } = data;

    if (isChannel) {
      try {
        const channel = await Channel.findById(chatId)
          .populate("members")
          .exec(); // Properly await channel fetch

        if (channel?.members) {
          channel.members.forEach((member) => {
            if (member._id.toString() !== userId) {
              const memberSocketId = userSocketMap.get(member._id.toString());
              if (memberSocketId) {
                io.to(memberSocketId).emit("user-typing", {
                  chatId,
                  userId,
                  username,
                });
              }
            }
          });

          // Don't forget to notify channel admin if they're not a member
          if (channel.admin && channel.admin.toString() !== userId) {
            const adminSocketId = userSocketMap.get(channel.admin.toString());
            if (adminSocketId) {
              io.to(adminSocketId).emit("user-typing", {
                chatId,
                userId,
                username,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error handling typing event:", error);
      }
    } else {
      const recipientSocketId = userSocketMap.get(chatId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user-typing", {
          chatId: userId,
          isTyping: true,
        });
      }
    }
  };

  const handleStopTyping = async (data) => {
    // Make this async too
    const { chatId, userId, isChannel } = data;

    if (isChannel) {
      try {
        const channel = await Channel.findById(chatId)
          .populate("members")
          .exec();

        if (channel?.members) {
          channel.members.forEach((member) => {
            if (member._id.toString() !== userId) {
              const memberSocketId = userSocketMap.get(member._id.toString());
              if (memberSocketId) {
                io.to(memberSocketId).emit("user-stop-typing", {
                  chatId,
                  userId,
                });
              }
            }
          });

          // Handle admin notification for stop typing
          if (channel.admin && channel.admin.toString() !== userId) {
            const adminSocketId = userSocketMap.get(channel.admin.toString());
            if (adminSocketId) {
              io.to(adminSocketId).emit("user-stop-typing", {
                chatId,
                userId,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error handling stop typing event:", error);
      }
    } else {
      const recipientSocketId = userSocketMap.get(chatId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user-stop-typing", {
          chatId: userId,
        });
      }
    }
  };

  const handleReaction = async (data) => {
    const { messageId, emoji, isChannel } = data;
    const userId = data.userId;

    try {
      const message = await Message.findById(messageId)
        .populate("sender")
        .populate("recipient");

      if (isChannel) {
        const channel = await Channel.findOne({ messages: messageId });
        if (channel?.members) {
          // Broadcast to channel members
          channel.members.forEach((member) => {
            const memberSocketId = userSocketMap.get(member._id.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit("reaction-update", {
                messageId,
                reactions: message.reactions,
                channelId: channel._id,
              });
            }
          });
        }
      } else {
        // DM reaction - notify both sender and recipient
        const senderSocketId = userSocketMap.get(message.sender._id.toString());
        const recipientSocketId = userSocketMap.get(
          message.recipient._id.toString()
        );

        if (senderSocketId) {
          io.to(senderSocketId).emit("reaction-update", {
            messageId,
            reactions: message.reactions,
          });
        }
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("reaction-update", {
            messageId,
            reactions: message.reactions,
          });
        }
      }
    } catch (error) {
      console.log("Error in handleReaction:", error);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket Id: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("disconnect", () => disconnect(socket));

    socket.on("typing-started", handleTyping);
    socket.on("typing-stopped", handleStopTyping);

    socket.on("send-reaction", handleReaction);
  });
};

export default setupSocket;
