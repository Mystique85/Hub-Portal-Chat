// src/components/chat/PublicChat.jsx
import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import MessageList from './MessageList';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/constants';

const PublicChat = ({ currentUser, onUpdateLastSeen }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt();

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !db || isSending) return;

    setIsSending(true);
    
    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'sendMessage',
        args: [newMessage],
      });
      
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        avatarType: currentUser.avatarType,
        walletAddress: currentUser.walletAddress,
        timestamp: serverTimestamp()
      });
      
      setNewMessage('');
      onUpdateLastSeen(currentUser.walletAddress);
      
    } catch (error) {
      console.error('Send message failed:', error);
      alert('Failed to send message: ' + (error.message || 'Check console for details'));
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

  return (
    <section className="flex-1 flex flex-col p-6 min-h-0">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <MessageList 
          messages={messages}
          currentUser={currentUser}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 flex-shrink-0">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message in public chat... (Enter to send)"
          disabled={isSending}
          className="flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-0 disabled:opacity-50"
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          {isSending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </section>
  );
};

export default PublicChat;