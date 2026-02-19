const GestureCard = ({ gesture }) => {
  if (!gesture) return null;

  const confidencePercent = Math.round(gesture.confidence * 100);

  const getEmoji = (name) => {
    const emojis = {
      fist: "✊",
      pointing: "👆",
      peace: "✌️",
      open_hand: "🖐️",
      thumbs_up: "👍",
      pinky: "🤙",
      rock: "🤘",
      no_hand: "❌",
      unknown: "❓",
    };
    return emojis[name] || "🖐️";
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 text-center shadow-xl border border-purple-500">
      <div className="text-7xl mb-4">{getEmoji(gesture.gesture_name)}</div>
      <h2 className="text-2xl font-bold text-white capitalize mb-2">
        {gesture.gesture_name.replace("_", " ")}
      </h2>
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
        <div
          className="bg-purple-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${confidencePercent}%` }}
        />
      </div>
      <p className="text-gray-400 text-sm">
        Confidence: {confidencePercent}%
      </p>
      <p className="text-gray-500 text-xs mt-1">
        Latency: {gesture.latency_ms?.toFixed(1)}ms
      </p>
    </div>
  );
};

export default GestureCard;