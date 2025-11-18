import MessageItem from './MessageItem';

const MessageList = ({ messages, currentUser, onDeleteMessage, isMobile = false }) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-center text-gray-400 ${isMobile ? 'px-4' : ''}`}>
          <div className={`${isMobile ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>💬</div>
          <p className={isMobile ? 'text-lg mb-1' : 'text-xl mb-2'}>No messages yet</p>
          <p className={isMobile ? 'text-xs' : 'text-sm'}>Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      w-full
      ${isMobile 
        ? 'space-y-3 px-2'  // MNIEJSZE: odstępy i paddingi
        : 'space-y-4 max-w-5xl px-6'
      }
    `}>
      {messages.map(msg => (
        <MessageItem 
          key={msg.id} 
          msg={msg}
          currentUser={currentUser}
          onDeleteMessage={onDeleteMessage}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

export default MessageList;