import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ADMIN_ADDRESSES } from '../../utils/constants';

const PrivateChat = ({ activeDMChat, currentUser, onClose, onMarkAsRead }) => {
  const [privateMessages, setPrivateMessages] = useState([]);
  const [privateMessageInput, setPrivateMessageInput] = useState('');
  const [isSendingPrivate, setIsSendingPrivate] = useState(false);
  
  const privateMessagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeDMChat || !db) return;

    const otherParticipant = Object.keys(activeDMChat.participantNames)
      .find(key => key !== currentUser.walletAddress.toLowerCase());
    
    if (otherParticipant && onMarkAsRead) {
      onMarkAsRead(otherParticipant);
    }

    const privateMessagesQuery = query(
      collection(db, 'private_chats', activeDMChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribePrivateMessages = onSnapshot(privateMessagesQuery, (snapshot) => {
      const privateMessagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrivateMessages(privateMessagesData);
    });

    return () => unsubscribePrivateMessages();
  }, [activeDMChat]);

  useEffect(() => {
    privateMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [privateMessages]);

  const sendPrivateMessage = async () => {
    if (!activeDMChat || !privateMessageInput.trim() || !db || isSendingPrivate) return;

    setIsSendingPrivate(true);
    
    try {
      await addDoc(collection(db, 'private_chats', activeDMChat.id, 'messages'), {
        content: privateMessageInput,
        sender: currentUser.walletAddress,
        senderNickname: currentUser.nickname,
        senderAvatar: currentUser.avatar,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'private_chats', activeDMChat.id), {
        lastMessage: serverTimestamp(),
        lastMessageContent: privateMessageInput
      });

      setPrivateMessageInput('');
      
    } catch (error) {
      console.error('Send private message failed:', error);
      alert('Failed to send private message');
    } finally {
      setIsSendingPrivate(false);
    }
  };

  const handlePrivateKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrivateMessage();
    }
  };

  const otherParticipant = Object.keys(activeDMChat.participantNames)
    .find(key => key !== currentUser.walletAddress.toLowerCase());

  const isOtherAdmin = ADMIN_ADDRESSES.includes(otherParticipant?.toLowerCase());

  return (
    <div className="w-96 bg-gray-800/50 backdrop-blur-xl border-l border-gray-700/50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-lg">
            {activeDMChat.participantAvatars[otherParticipant]}
          </div>
          <div>
            <div className="text-white font-semibold flex items-center gap-2">
              {activeDMChat.participantNames[otherParticipant]}
              {isOtherAdmin && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  ADMIN
                </span>
              )}
            </div>
            <div className="text-green-400 text-sm">Online</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl transition-all hover:scale-110"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {privateMessages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-6xl mb-4">💬</div>
            <p>Start a private conversation</p>
            <p className="text-sm text-gray-500 mt-2">Your messages are end-to-end encrypted</p>
          </div>
        ) : (
          privateMessages.map(msg => (
            <div 
              key={msg.id} 
              className={`p-4 rounded-2xl max-w-[280px] ${
                msg.sender === currentUser.walletAddress
                  ? 'bg-cyan-500/20 ml-auto border border-cyan-500/30'
                  : 'bg-gray-700/50 border border-gray-600/50'
              }`}
            >
              <div className="text-white break-all overflow-hidden">{msg.content}</div>
              <div className="text-gray-400 text-xs mt-2 text-right">
                {msg.timestamp?.toDate?.().toLocaleTimeString() || 'Now'}
              </div>
            </div>
          ))
        )}
        <div ref={privateMessagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={privateMessageInput}
            onChange={(e) => setPrivateMessageInput(e.target.value)}
            placeholder={`Type a private message...`}
            onKeyPress={handlePrivateKeyPress}
            className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
          />
          <button
            onClick={sendPrivateMessage}
            disabled={!privateMessageInput.trim() || isSendingPrivate}
            className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {isSendingPrivate ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateChat;