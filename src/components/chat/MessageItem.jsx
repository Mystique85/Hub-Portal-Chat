import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import ReactionBar from './ReactionBar';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useReactions } from '../../hooks/useReactions';
import ReactionPicker from './ReactionPicker';

const MessageItem = ({ msg, currentUser, onDeleteMessage, isMobile = false, onReply, onPrivateMessage, onScrollToMessage }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSimpleMenu, setShowSimpleMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { toggleReaction } = useReactions(msg.id, currentUser);

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

  const handleUserClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ 
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    setShowSimpleMenu(true);
  };

  const handleReact = () => {
    setShowSimpleMenu(false);
    setShowReactionPicker(true);
  };

  const handleReactionSelect = async (emoji) => {
    await toggleReaction(emoji);
    setShowReactionPicker(false);
  };

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

  const handleQuoteClick = () => {
    if (msg.replyTo && onScrollToMessage) {
      onScrollToMessage(msg.replyTo.messageId);
    }
  };

  const isAdmin = ADMIN_ADDRESSES.includes(msg.walletAddress?.toLowerCase());
  const canDelete = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());
  const processedText = processMessageForEmbeds(msg.content, isAdmin);
  const renderedContent = renderMessageWithEmbeds(processedText);

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
              <span className="text-white text-xs font-medium">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-white text-red-600 text-xs px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-600 text-white text-xs px-2 py-1 rounded hover:bg-gray-500 transition-all"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs transition-all hover:scale-110 shadow-lg ${
                isMobile ? 'w-5 h-5' : 'w-6 h-6'
              }`}
              title="Delete message"
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <div 
          className={`
            rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold cursor-pointer hover:scale-110 transition-transform
            ${isMobile 
              ? 'w-6 h-6 text-xs'
              : 'w-8 h-8 text-sm'
            }
          `}
          onClick={handleUserClick}
        >
          {msg.avatar}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <strong 
              className={`cursor-pointer hover:text-cyan-300 transition-colors ${
                isMobile ? 'text-white text-sm' : 'text-white'
              }`}
              onClick={handleUserClick}
            >
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

      {/* REPLY QUOTE - CLICKABLE */}
      {msg.replyTo && (
        <div 
          className="bg-gray-700/30 border-l-2 border-cyan-500 pl-3 py-2 mb-3 rounded-r-lg cursor-pointer hover:bg-gray-700/50 transition-all group/quote"
          onClick={handleQuoteClick}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-400 text-sm">↶</span>
            <span className="text-cyan-400 text-sm font-medium group-hover/quote:text-cyan-300 transition-colors">
              Replying to @{msg.replyTo.nickname}
            </span>
          </div>
          <div className="text-gray-300 text-sm group-hover/quote:text-white transition-colors">
            {msg.replyTo.content}
          </div>
        </div>
      )}
      
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

      {/* PORTAL - menu renders outside message container */}
      {showSimpleMenu && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowSimpleMenu(false)}
          />
          <div 
            className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-xl p-2 shadow-2xl z-[9999] min-w-[160px]"
            style={{
              left: menuPosition.x + 'px',
              top: menuPosition.y + 'px'
            }}
          >
            <button 
              onClick={() => { setShowSimpleMenu(false); onReply(msg); }}
              className="w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg flex items-center gap-3 transition-all"
            >
              <span className="text-green-400">↶</span>
              <span>Reply</span>
            </button>
            
            <button 
              onClick={() => { setShowSimpleMenu(false); onPrivateMessage(msg); }}
              className="w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg flex items-center gap-3 transition-all"
            >
              <span className="text-cyan-400">💬</span>
              <span>Private Message</span>
            </button>
            
            <button 
              onClick={handleReact}
              className="w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg flex items-center gap-3 transition-all"
            >
              <span className="text-yellow-400">👍</span>
              <span>Add Reaction</span>
            </button>
            
            <button 
              onClick={() => setShowSimpleMenu(false)}
              className="w-full text-left px-4 py-3 hover:bg-gray-700/50 rounded-lg flex items-center gap-3 transition-all"
            >
              <span className="text-purple-400">👁️</span>
              <span>View Profile</span>
            </button>
          </div>
        </>,
        document.body
      )}

      {showReactionPicker && (
        <ReactionPicker 
          onReactionSelect={handleReactionSelect}
          onClose={() => setShowReactionPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageItem;