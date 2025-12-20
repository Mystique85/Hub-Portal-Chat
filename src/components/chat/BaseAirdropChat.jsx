import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import MessageList from './MessageList';
import { useNetwork } from '../../hooks/useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../utils/constants';

const BaseAirdropChat = ({ 
  currentUser, 
  onUpdateLastSeen, 
  onDeleteMessage, 
  isMobile = false, 
  onStartPrivateChat, 
  onViewProfile, 
  updateUserMessageCount 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { writeContract, data: transactionHash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const { currentNetwork, isBase, tokenSymbol } = useNetwork();

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const baseAirdropMessages = allMessages.filter(msg => 
        msg.channel === 'base-airdrop'
      );
      
      setMessages(baseAirdropMessages);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
    });

    return () => unsubscribeMessages();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      };
      
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isConfirmed && pendingTransaction) {
      addMessageToFirestore(pendingTransaction);
      setPendingTransaction(null);
    }
  }, [isConfirmed, pendingTransaction]);

  const addMessageToFirestore = async (messageData) => {
    try {
      const newMessageDoc = {
        content: messageData.content,
        nickname: messageData.nickname,
        avatar: messageData.avatar,
        avatarType: messageData.avatarType,
        walletAddress: messageData.walletAddress,
        replyTo: messageData.replyTo || null,
        channel: 'base-airdrop',
        timestamp: serverTimestamp(),
        network: 'base'
      };

      await addDoc(collection(db, 'messages'), newMessageDoc);
      
      if (updateUserMessageCount) {
        await updateUserMessageCount(messageData.walletAddress);
      }
      
      onUpdateLastSeen(messageData.walletAddress);
    } catch (error) {
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    
    setTimeout(() => {
      if (messageInputRef.current) {
        messageInputRef.current.focus();
        messageInputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePrivateMessage = (message) => {
    if (onStartPrivateChat) {
      const user = {
        walletAddress: message.walletAddress,
        nickname: message.nickname,
        avatar: message.avatar
      };
      onStartPrivateChat(user);
    }
  };

  const handleScrollToMessage = (messageId) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      messageElement.classList.add('bg-blue-500/20', 'border-blue-500/50');
      setTimeout(() => {
        messageElement.classList.remove('bg-blue-500/20', 'border-blue-500/50');
      }, 2000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !db || isSending || !isBase) {
      return;
    }

    setIsSending(true);
    
    try {
      const messageData = {
        content: newMessage,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        avatarType: currentUser.avatarType,
        walletAddress: currentUser.walletAddress,
        replyTo: replyingTo ? {
          messageId: replyingTo.id,
          nickname: replyingTo.nickname,
          content: replyingTo.content,
          avatar: replyingTo.avatar
        } : null
      };
      
      setPendingTransaction(messageData);
      
      writeContract({
        address: CONTRACT_ADDRESSES.base,
        abi: CONTRACT_ABIS.base,
        functionName: 'sendMessage',
        args: [newMessage],
      });
      
      setNewMessage('');
      setReplyingTo(null);
      
    } catch (error) {
      alert('Failed to send message: ' + (error.message || 'Check console for details'));
      setPendingTransaction(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (onDeleteMessage) {
      return await onDeleteMessage(messageId);
    }
    return false;
  };

  const getPlaceholderText = () => {
    if (replyingTo) return `Reply To @${replyingTo.nickname}...`;
    
    const baseText = isMobile ? "Type message..." : "Discuss airdrops, new projects, strategies... (Enter to send)";
    
    return `${baseText}`;
  };

  if (!isBase) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🌉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Base Network Only</h2>
          <p className="text-gray-400">
            Airdrops & New Projects chat is available only on Base network.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Switch to Base network to access this channel.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading Airdrops & New Projects chat...</p>
        </div>
      </div>
    );
  }

  return (
    <section className={`flex flex-col h-full min-h-0 ${isMobile ? 'p-2' : 'p-6'}`}>
      <div className={`mb-2 text-center ${isMobile ? 'p-1' : 'p-2'} bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30`}>
        <div className="flex items-baseline justify-center gap-1">
          <h2 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Airdrops & New Projects
          </h2>
          <span className="text-gray-300 text-xs">
            - Community hub for Base network airdrops, new launches and project discoveries
          </span>
        </div>
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isMobile ? 'mb-2' : 'mb-4'}`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center text-gray-400 ${isMobile ? 'px-4' : ''}`}>
              <div className={`${isMobile ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>🎁</div>
              <p className={isMobile ? 'text-lg mb-1' : 'text-xl mb-2'}>Airdrops & New Projects chat is empty</p>
              <p className={isMobile ? 'text-xs' : 'text-sm'}>
                Start the conversation about airdrops and new projects!
              </p>
              <div className="mt-4 inline-block bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm">
                💡 Your messages will appear here in real-time
              </div>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            onReply={handleReply}
            onPrivateMessage={handlePrivateMessage}
            onViewProfile={onViewProfile}
            onScrollToMessage={handleScrollToMessage}
            isMobile={isMobile}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 mb-3 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-blue-400 text-lg flex-shrink-0">↶</span>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-blue-400 text-sm font-medium truncate">
                Replying to <strong>@{replyingTo.nickname}</strong>
              </div>
              <div className="text-gray-300 text-xs truncate">
                {replyingTo.content}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-white text-lg flex-shrink-0 ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className={`flex gap-2 bg-gray-800/50 backdrop-blur-xl border border-blue-500/30 rounded-xl flex-shrink-0 ${isMobile ? 'mt-auto p-2' : 'p-4 rounded-2xl'}`}>
        <input 
          ref={messageInputRef}
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholderText()}
          disabled={isSending || !isBase}
          className={`flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
            isMobile ? 'text-sm px-2' : 'px-3'
          }`}
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending || !isBase}
          className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ${
            isMobile 
              ? 'px-3 py-2 rounded-lg text-xs min-h-[36px]' 
              : 'px-6 py-3 rounded-xl'
          }`}
        >
          {isSending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              {isMobile ? '' : 'Sending...'}
            </div>
          ) : isConfirming ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              {isMobile ? '' : 'Confirming...'}
            </div>
          ) : (
            isMobile ? '🎁' : 'Send'
          )}
        </button>
      </div>
    </section>
  );
};

export default BaseAirdropChat;