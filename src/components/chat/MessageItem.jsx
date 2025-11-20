import { useState } from 'react';
import ReactionBar from './ReactionBar';
import { ADMIN_ADDRESSES } from '../../utils/constants';

const MessageItem = ({ msg, currentUser, onDeleteMessage, isMobile = false }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatMessageTime = (timestamp) => {
    if (!timestamp?.toDate) return 'Now';
    
    const messageDate = timestamp.toDate();
    
    if (isMobile) {
      return `${messageDate.getDate().toString().padStart(2, '0')}.${(messageDate.getMonth() + 1).toString().padStart(2, '0')} ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return `${messageDate.getDate().toString().padStart(2, '0')}.${(messageDate.getMonth() + 1).toString().padStart(2, '0')} ${messageDate.getHours().toString().padStart(2, '0')}:${messageDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const processMessageForEmbeds = (text, isAdmin) => {
    if (!isAdmin) return text;
    
    const embedRegex = /\[(tweet|video|doc|discord|announce|link)\|([^\]]+)\|([^\]]+)\]/g;
    
    return text.replace(embedRegex, (match, type, displayText, url) => {
      const icons = {
        tweet: '📢',
        video: '🎥',
        doc: '📚',
        discord: '🎮',
        announce: '📢',
        link: '🔗'
      };
      
      return `${icons[type] || '🔗'} [${displayText}](${url})`;
    });
  };

  const renderMessageWithEmbeds = (processedText) => {
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    return processedText.split(markdownLinkRegex).map((part, index) => {
      if (index % 3 === 1) {
        const url = processedText.split(markdownLinkRegex)[index + 1];
        return (
          <a 
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      if (index % 3 === 2) return null;
      return part;
    }).filter(Boolean);
  };

  const isAdmin = ADMIN_ADDRESSES.includes(msg.walletAddress?.toLowerCase());
  const canDelete = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());
  const processedText = processMessageForEmbeds(msg.content, isAdmin);
  const renderedContent = renderMessageWithEmbeds(processedText);

  const handleDelete = async () => {
    if (!canDelete || !onDeleteMessage) return;
    
    setIsDeleting(true);
    try {
      await onDeleteMessage(msg.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`
      bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all group relative
      ${isMobile 
        ? 'rounded-xl p-3'
        : 'rounded-2xl p-4'
      }
    `}>
      {canDelete && (
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
          isMobile ? '-top-1 -right-1' : '-top-2 -right-2'
        }`}>
          {showDeleteConfirm ? (
            <div className="bg-red-500/90 backdrop-blur-sm border border-red-400 rounded-xl p-2 shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-200">
              <span className="text-white text-xs font-medium">Usunąć?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-white text-red-600 text-xs px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                {isDeleting ? '...' : 'Tak'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-600 text-white text-xs px-2 py-1 rounded hover:bg-gray-500 transition-all"
              >
                Nie
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-all hover:scale-110 shadow-lg ${
                isMobile ? 'w-5 h-5' : 'w-6 h-6'
              }`}
              title="Usuń wiadomość"
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div className={`
          rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold
          ${isMobile 
            ? 'w-6 h-6 text-xs'
            : 'w-8 h-8 text-sm'
          }
        `}>
          {msg.avatar}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <strong className={isMobile ? 'text-white text-sm' : 'text-white'}>
              {msg.nickname}
            </strong>
            {isAdmin && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                ADMIN
              </span>
            )}
          </div>
          <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {formatMessageTime(msg.timestamp)}
          </span>
        </div>
      </div>
      
      <div className={`${isMobile ? 'text-white text-sm mb-2' : 'text-white mb-2'} break-all overflow-hidden`}>
        {renderedContent}
      </div>
      
      <div className="flex gap-2 items-center justify-between">
        <ReactionBar 
          messageId={msg.id}
          currentUser={currentUser}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default MessageItem;