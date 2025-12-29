import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ADMIN_ADDRESSES } from '../../utils/constants';

const MessageItem = ({ msg, currentUser, onDeleteMessage, isMobile = false, onReply, onScrollToMessage, onViewProfile }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSimpleMenu, setShowSimpleMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, direction: 'up' });
  const [isHovered, setIsHovered] = useState(false);

  const isAdmin = ADMIN_ADDRESSES.includes(msg.walletAddress?.toLowerCase());
  const canDelete = currentUser && ADMIN_ADDRESSES.includes(currentUser.walletAddress?.toLowerCase());
  
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

  const processedText = processMessageForEmbeds(msg.content, isAdmin);
  
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
            className={`text-cyan-400 hover:text-cyan-300 underline font-medium break-words ${
              isMobile ? 'text-xs' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ wordBreak: 'break-word' }}
          >
            {part}
          </a>
        );
      }
      if (index % 3 === 2) return null;
      return part;
    }).filter(Boolean);
  };

  const renderedContent = renderMessageWithEmbeds(processedText);

  const handleMouseEnter = () => {
    if (!isMobile) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsHovered(false);
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    const menuHeight = isMobile ? 120 : 150;
    
    let direction = 'down';
    let yPosition = rect.bottom + window.scrollY + 5;
    
    if (spaceAbove > menuHeight && spaceAbove > spaceBelow) {
      direction = 'up';
      yPosition = rect.top + window.scrollY - 5;
    }
    else if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      direction = 'up';
      yPosition = rect.top + window.scrollY - 5;
    }
    
    setMenuPosition({ 
      x: rect.left,
      y: yPosition,
      direction: direction
    });
    setShowSimpleMenu(true);
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

  const getNetworkLabel = () => {
    if (!msg.network) return null;
    
    const networkConfig = {
      celo: { 
        text: 'CELO', 
        textColor: 'text-yellow-400',
        logo: '/Celo.logo.jpg',
        fallbackIcon: '📱' 
      },
      base: { 
        text: 'BASE', 
        textColor: 'text-blue-400',
        logo: '/Base.logo.jpg',
        fallbackIcon: '🌉' 
      },
      linea: { 
        text: 'LINEA', 
        textColor: 'text-cyan-400',
        logo: '/Linea.logo.png',
        fallbackIcon: '🚀' 
      },
      polygon: { 
        text: 'POLYGON', 
        textColor: 'text-purple-400',
        logo: '/Polygon.logo.jpg',
        fallbackIcon: '🔷' 
      }
    };
    
    const config = networkConfig[msg.network];
    if (!config) return null;
    
    return (
      <div className="flex items-center gap-1">
        <img 
          src={config.logo} 
          alt={config.text}
          className="w-3 h-3 object-cover rounded"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<span class="text-xs">${config.fallbackIcon}</span>`;
          }}
        />
        <span className={`${config.textColor} text-xs font-medium`}>
          {config.text}
        </span>
      </div>
    );
  };

  return (
    <div className={`
      bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all group relative
      ${isMobile 
        ? 'rounded-lg p-2.5 max-w-full'
        : 'rounded-2xl p-4'
      }
    `}>
      {canDelete && (
        <div className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
          isMobile ? '-top-0.5 -right-0.5' : '-top-2 -right-2'
        }`}>
          {showDeleteConfirm ? (
            <div className={`bg-red-500/90 backdrop-blur-sm border border-red-400 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
              isMobile ? 'p-1.5' : 'p-2 rounded-xl'
            }`}>
              <span className={`text-white font-medium ${
                isMobile ? 'text-[10px]' : 'text-xs'
              }`}>Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`bg-white text-red-600 hover:bg-gray-100 disabled:opacity-50 transition-all ${
                  isMobile ? 'text-[10px] px-1.5 py-0.5 rounded' : 'text-xs px-2 py-1 rounded'
                }`}
              >
                {isDeleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`bg-gray-600 text-white hover:bg-gray-500 transition-all ${
                  isMobile ? 'text-[10px] px-1.5 py-0.5 rounded' : 'text-xs px-2 py-1 rounded'
                }`}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all ${
                isMobile ? 'w-4 h-4 text-[10px]' : 'w-6 h-6 text-xs'
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
            rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-bold cursor-pointer transition-all relative
            ${isMobile 
              ? 'w-5 h-5 text-[10px] hover:scale-110'
              : `w-8 h-8 text-sm ${isHovered ? 'scale-110 shadow-lg ring-2 ring-cyan-400/50' : 'hover:scale-110'}`
            }
          `}
          onClick={handleUserClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title={isMobile ? "Tap for options" : "Click for options"}
        >
          {msg.avatar}
          {!isMobile && isHovered && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <strong 
              className={`
                cursor-pointer transition-all duration-200 relative
                ${isMobile 
                  ? 'text-white text-xs hover:text-cyan-300' 
                  : `text-white ${isHovered ? 'text-cyan-300 underline' : 'hover:text-cyan-300 hover:underline'}`
                }
              `}
              onClick={handleUserClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              title={isMobile ? "Tap for options" : "Click for options"}
            >
              {msg.nickname}
              <span className={`
                transition-opacity duration-200
                ${isMobile 
                  ? 'opacity-60' 
                  : isHovered ? 'opacity-100' : 'opacity-40'
                }
              `}> ›</span>
            </strong>
            
            {isAdmin && (
              <span className="text-red-400 text-xs font-medium ml-1">
                ADMIN
              </span>
            )}
            
            {getNetworkLabel()}
          </div>
          
          <span className={`text-gray-400 ${isMobile ? 'text-[10px]' : 'text-sm'}`}>
            {formatMessageTime(msg.timestamp)}
          </span>
        </div>
      </div>

      {msg.replyTo && (
        <div 
          className={`bg-gray-700/30 border-l-2 border-cyan-500 rounded-r-lg cursor-pointer hover:bg-gray-700/50 transition-all group/quote mb-3 ${
            isMobile ? 'pl-2 py-1.5' : 'pl-3 py-2'
          }`}
          onClick={handleQuoteClick}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-cyan-400 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>↶</span>
            <span className={`text-cyan-400 font-medium group-hover/quote:text-cyan-300 transition-colors ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Replying to @{msg.replyTo.nickname}
            </span>
          </div>
          <div className={`text-gray-300 group-hover/quote:text-white transition-colors ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            {msg.replyTo.content}
          </div>
        </div>
      )}
      
      <div className={`text-white break-words overflow-x-hidden mb-2 max-w-full ${
        isMobile ? 'text-xs' : 'text-sm'
      }`}>
        {renderedContent}
      </div>

      {showSimpleMenu && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowSimpleMenu(false)}
          />
          <div 
            className={`fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] ${
              isMobile 
                ? 'min-w-[160px] p-1.5' 
                : 'min-w-[180px] p-2 rounded-xl'
            }`}
            style={{
              left: menuPosition.x + 'px',
              top: menuPosition.y + 'px',
              transform: menuPosition.direction === 'up' ? 'translateY(-100%)' : 'none'
            }}
          >
            <button 
              onClick={() => { setShowSimpleMenu(false); onReply(msg); }}
              className={`w-full text-left rounded-lg flex items-center gap-3 transition-colors duration-150 text-gray-800 hover:bg-green-50 hover:text-green-700 group/button ${
                isMobile ? 'px-3 py-2' : 'px-4 py-3'
              }`}
            >
              <span className={`text-green-500 transition-transform duration-150 group-hover/button:scale-110 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>↶</span>
              <span className={`font-medium ${
                isMobile ? 'text-xs' : ''
              }`}>Reply</span>
            </button>
            
            <button 
              onClick={() => { 
                setShowSimpleMenu(false); 
                if (onViewProfile) {
                  onViewProfile(msg);
                }
              }}
              className={`w-full text-left rounded-lg flex items-center gap-3 transition-colors duration-150 text-gray-800 hover:bg-purple-50 hover:text-purple-700 group/button ${
                isMobile ? 'px-3 py-2' : 'px-4 py-3'
              }`}
            >
              <span className={`text-purple-500 transition-transform duration-150 group-hover/button:scale-110 ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>👁️</span>
              <span className={`font-medium ${
                isMobile ? 'text-xs' : ''
              }`}>View Profile</span>
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default MessageItem;