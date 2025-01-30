import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { REACT_TO_MESSAGE_ROUTE } from "@/utils/constants";
import { useSocket } from "@/context/SocketContext";
import { useEffect } from "react";

const ReactionTooltip = ({ messageId }) => {
  const { hoveredMessageId, setHoveredMessageId, selectedChatType, userInfo } =
    useAppStore();
  const socket = useSocket();

  useEffect(() => {
    setHoveredMessageId(messageId);
  }, [messageId]);

  const emojis = [
    { type: "laugh", icon: "😄" },
    { type: "thumbsUp", icon: "👍" },
    { type: "thumbsDown", icon: "👎" },
    { type: "love", icon: "❤️" },
  ];

  const addReaction = async (messageId, emoji, isChannel) => {
    try {
      const response = await apiClient.post(
        REACT_TO_MESSAGE_ROUTE,
        {
          messageId,
          emoji,
        },
        { withCredentials: true }
      );

      if (socket) {
        socket.emit("send-reaction", {
          messageId,
          emoji,
          isChannel,
          userId: userInfo.id,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-[#2a2b33] rounded-lg shadow-lg p-2 flex gap-2">
      {emojis.map(({ type, icon }) => (
        <button
          key={type}
          onClick={() =>
            addReaction(messageId, type, selectedChatType === "channel")
          }
          className="hover:bg-black/20 p-1 rounded transition-all"
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default ReactionTooltip;
