import MessageItem from './MessageItem';

const MessageList = ({ messages, currentUser, onDeleteMessage }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl mb-2">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl px-6 w-full">
      {messages.map(msg => (
        <MessageItem 
          key={msg.id} 
          msg={msg}
          currentUser={currentUser}
          onDeleteMessage={onDeleteMessage}
        />
      ))}
    </div>
  );
};

export default MessageList;