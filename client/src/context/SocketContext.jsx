import { useAppStore } from "@/store";
import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { HOST } from "@/utils/constants";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      const handleRecieveMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addContactsInDMContacts,
        } = useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          // console.log("message received", message);
          addMessage(message);
        }
        addContactsInDMContacts(message);
      };

      const handleRecieveChannelMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addChannelInChannelList,
        } = useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);
        }

        addChannelInChannelList(message);
      };

      const handleUserTyping = (data) => {
        const { setTypingStatus } = useAppStore.getState();
        if ("username" in data) {
          // Channel typing
          setTypingStatus(data.chatId, data.userId, data.username, true);
        } else {
          // DM typing
          setTypingStatus(data.chatId, null, null, true);
        }
      };

      const handleUserStopTyping = (data) => {
        const { clearTypingStatus } = useAppStore.getState();
        clearTypingStatus(data.chatId);
      };

      const handleReactionUpdate = (data) => {
        const { updateMessageReactions } = useAppStore.getState();
        updateMessageReactions(data.messageId, data.reactions, data.channelId);
      };

      socket.current.on("reaction-update", handleReactionUpdate);

      socket.current.on("user-typing", handleUserTyping);
      socket.current.on("user-stop-typing", handleUserStopTyping);

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);

      return () => {
        socket.current.off("user-typing", handleUserTyping);
        socket.current.off("user-stop-typing", handleUserStopTyping);

        socket.current.off("reaction-update", handleReactionUpdate);

        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
