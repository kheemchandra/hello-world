const MessageReactions = ({ reactions, isRight }) => {
  const emojiMap = {
    laugh: "😄",
    thumbsUp: "👍",
    thumbsDown: "👎",
    love: "❤️",
  };

  // Group reactions by emoji type
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={`flex gap-2 mt-1 ${isRight ? "justify-end" : "justify-start"}`}
    >
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <span
          key={emoji}
          className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full text-sm"
        >
          {emojiMap[emoji]}
          <span>{count}</span>
        </span>
      ))}
    </div>
  );
};

export default MessageReactions;
