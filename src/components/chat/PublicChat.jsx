import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import MessageList from './MessageList';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/constants';

const PublicChat = ({ currentUser, onUpdateLastSeen, onDeleteMessage, isMobile = false, onStartPrivateChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const { writeContract, data: transactionHash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  useEffect(() => {
    if (!db) return;

    const messagesQuery = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesData);
    });

    return () => unsubscribeMessages();
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'auto',
          block: 'end',
          inline: 'nearest'
        });
      }
    };
    
    scrollToBottom();
    const timer1 = setTimeout(scrollToBottom, 200);
    const timer2 = setTimeout(scrollToBottom, 500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [messages]);

  useEffect(() => {
    if (isConfirmed && pendingTransaction) {
      addMessageToFirestore(pendingTransaction);
      setPendingTransaction(null);
    }
  }, [isConfirmed, pendingTransaction]);

  const addMessageToFirestore = async (messageData) => {
    try {
      await addDoc(collection(db, 'messages'), {
        content: messageData.content,
        nickname: messageData.nickname,
        avatar: messageData.avatar,
        avatarType: messageData.avatarType,
        walletAddress: messageData.walletAddress,
        replyTo: messageData.replyTo || null,
        timestamp: serverTimestamp()
      });
      
      onUpdateLastSeen(messageData.walletAddress);
      console.log("✅ Wiadomość dodana do Firestore PO potwierdzeniu transakcji");
    } catch (error) {
      console.error('Error adding message to Firestore:', error);
    }
  };

  const handleReply = (message) => {
    console.log("Odpowiedz do:", message.nickname);
    setReplyingTo(message);
    
    // Focus na input
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
      
      // Dodaj efekt highlight
      messageElement.classList.add('bg-cyan-500/20', 'border-cyan-500/50');
      setTimeout(() => {
        messageElement.classList.remove('bg-cyan-500/20', 'border-cyan-500/50');
      }, 2000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !db || isSending) return;

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
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'sendMessage',
        args: [newMessage],
      });
      
      setNewMessage('');
      setReplyingTo(null);
      
    } catch (error) {
      console.error('Send message failed:', error);
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

  return (
    <section className={`flex flex-col h-full min-h-0 ${isMobile ? 'p-2' : 'p-6'}`}>
      <div className={`flex-1 min-h-0 overflow-y-auto ${isMobile ? 'mb-2' : 'mb-4'}`}>
        <MessageList 
          messages={messages}
          currentUser={currentUser}
          onDeleteMessage={handleDeleteMessage}
          onReply={handleReply}
          onPrivateMessage={handlePrivateMessage}
          onScrollToMessage={handleScrollToMessage}
          isMobile={isMobile}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Wyświetl informację o odpowiedzi */}
      {replyingTo && (
        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 text-lg">↶</span>
            <div className="flex-1 min-w-0">
              <div className="text-cyan-400 text-sm font-medium">
                Odpowiadasz <strong>@{replyingTo.nickname}</strong>
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

      <div className={`flex gap-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl flex-shrink-0 ${isMobile ? 'mt-auto p-2' : 'p-4 rounded-2xl'}`}>
        <input 
          ref={messageInputRef}
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={replyingTo ? `Odpowiedz @${replyingTo.nickname}...` : (isMobile ? "Type message..." : "Type your message in public chat... (Enter to send)")}
          disabled={isSending}
          className={`flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-0 disabled:opacity-50 ${
            isMobile ? 'text-sm px-2' : 'px-3'
          }`}
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending}
          className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ${
            isMobile 
              ? 'px-3 py-2 rounded-lg text-sm min-h-[40px]' 
              : 'px-6 py-3 rounded-xl'
          }`}
        >
          {isSending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isMobile ? '' : 'Sending...'}
            </div>
          ) : isConfirming ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isMobile ? '' : 'Confirming...'}
            </div>
          ) : (
            isMobile ? '⬆️' : 'Send'
          )}
        </button>
      </div>
    </section>
  );
};

export default PublicChat;