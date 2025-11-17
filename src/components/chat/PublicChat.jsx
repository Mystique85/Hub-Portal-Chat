import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import MessageList from './MessageList';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../utils/constants';

const PublicChat = ({ currentUser, onUpdateLastSeen, onDeleteMessage, isMobile = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  
  const messagesEndRef = useRef(null);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        timestamp: serverTimestamp()
      });
      
      onUpdateLastSeen(messageData.walletAddress);
      console.log("✅ Wiadomość dodana do Firestore PO potwierdzeniu transakcji");
    } catch (error) {
      console.error('Error adding message to Firestore:', error);
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
        walletAddress: currentUser.walletAddress
      };
      
      setPendingTransaction(messageData);
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'sendMessage',
        args: [newMessage],
      });
      
      setNewMessage('');
      
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
    <section className={`flex flex-col h-full min-h-0 ${isMobile ? 'p-3' : 'p-6'}`}> {/* ← DODAJ min-h-0 */}
      {/* Messages List - scrollable */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${isMobile ? 'mb-3' : 'mb-4'}`}> {/* ← DODAJ min-h-0 */}
        <MessageList 
          messages={messages}
          currentUser={currentUser}
          onDeleteMessage={handleDeleteMessage}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - fixed at bottom */}
      <div className={`flex gap-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 flex-shrink-0 ${isMobile ? 'mt-auto' : ''}`}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isMobile ? "Type your message..." : "Type your message in public chat... (Enter to send)"}
          disabled={isSending}
          className="flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-0 disabled:opacity-50"
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending}
          className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ${
            isMobile ? 'px-4 py-3' : 'px-6 py-3'
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