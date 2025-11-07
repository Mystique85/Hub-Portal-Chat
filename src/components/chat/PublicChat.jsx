// src/components/chat/PublicChat.jsx - POPRAWIONA WERSJA Z EMBED LINKAMI
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
  const [pendingTransaction, setPendingTransaction] = useState(null);
  
  const messagesEndRef = useRef(null);
  const { writeContract, data: transactionHash } = useWriteContract();
  
  // ✅ Oczekiwanie na potwierdzenie transakcji
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  // ✅ ADRES ADMINISTRATORA - TYLKO TEN PORTFEL MOŻE WYSYŁAĆ LINKI
  const ADMIN_WALLET = '0x443baEF78686Fc6b9e5e6DaEA24fe26a170c5ac8';

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

  // ✅ Obsługa potwierdzenia transakcji
  useEffect(() => {
    if (isConfirmed && pendingTransaction) {
      addMessageToFirestore(pendingTransaction);
      setPendingTransaction(null);
    }
  }, [isConfirmed, pendingTransaction]);

  // ✅ FUNKCJA DO EMBEDOWANIA LINKÓW X/TWITTER - TYLKO DLA ADMINA
  const processMessageForEmbeds = (messageText, walletAddress) => {
    // Sprawdź czy to administrator
    const isAdmin = walletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();
    
    if (!isAdmin) {
      return messageText; // Zwróć oryginalną wiadomość jeśli nie admin
    }

    // Regex do wykrywania linków Twitter/X
    const twitterRegex = /https?:\/\/(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/g;
    
    // Zamiana na embed link
    const processedText = messageText.replace(twitterRegex, (match, username, tweetId) => {
      return `https://fxtwitter.com/${username}/status/${tweetId}`;
    });

    // Dodatkowo: YouTube embed
    const youtubeRegex = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/g;
    const withYoutube = processedText.replace(youtubeRegex, (match, videoId) => {
      return `https://www.youtube.com/embed/${videoId}`;
    });

    return withYoutube;
  };

  // ✅ Sprawdź czy użytkownik jest administratorem
  const isUserAdmin = () => {
    return currentUser && currentUser.walletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();
  };

  const addMessageToFirestore = async (messageData) => {
    try {
      // ✅ PRZETWÓRZ WIADOMOŚĆ DLA EMBEDÓW (tylko admin)
      const processedContent = processMessageForEmbeds(messageData.content, messageData.walletAddress);
      
      await addDoc(collection(db, 'messages'), {
        content: processedContent,
        nickname: messageData.nickname,
        avatar: messageData.avatar,
        avatarType: messageData.avatarType,
        walletAddress: messageData.walletAddress,
        timestamp: serverTimestamp(),
        isFromAdmin: isUserAdmin(), // ✅ Oznacz wiadomości od admina
        hasEmbed: processedContent !== messageData.content // ✅ Czy zawiera embed
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
      // ✅ ZAPISZ dane wiadomości
      const messageData = {
        content: newMessage,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        avatarType: currentUser.avatarType,
        walletAddress: currentUser.walletAddress
      };
      
      setPendingTransaction(messageData);
      
      // ✅ Wyślij transakcję do blockchain
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

  // ✅ Komponent dla embedów
  const TwitterEmbed = ({ url }) => {
    return (
      <div className="mt-2 border border-gray-600 rounded-lg overflow-hidden">
        <iframe
          src={url}
          className="w-full h-96 border-0"
          loading="lazy"
          title="Twitter Embed"
        />
      </div>
    );
  };

  // ✅ Funkcja do renderowania wiadomości z embedami
  const renderMessageWithEmbeds = (content) => {
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Sprawdź czy linia zawiera embed link
      if (line.includes('fxtwitter.com') || line.includes('vxtwitter.com')) {
        return (
          <div key={index}>
            <a 
              href={line} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {line}
            </a>
            <TwitterEmbed url={line} />
          </div>
        );
      }
      
      // Sprawdź czy linia zawiera YouTube embed
      if (line.includes('youtube.com/embed')) {
        return (
          <div key={index} className="mt-2">
            <iframe
              width="100%"
              height="315"
              src={line}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        );
      }
      
      return <div key={index}>{line}</div>;
    });
  };

  return (
    <section className="flex-1 flex flex-col p-6 min-h-0">
      {/* Admin Badge */}
      {isUserAdmin() && (
        <div className="mb-4 flex items-center justify-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>👑</span>
            <span>Administrator Mode - Embed Links Active</span>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`bg-gray-800/50 backdrop-blur-lg border rounded-2xl p-4 hover:border-cyan-500/50 transition-all group ${
              msg.isFromAdmin ? 'border-purple-500/50' : 'border-gray-700/50'
            }`}
          >
            {/* Message Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm">
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <strong className="text-white">{msg.nickname}</strong>
                  {msg.isFromAdmin && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">ADMIN</span>
                  )}
                </div>
                <span className="text-gray-400 text-sm">
                  {msg.timestamp?.toDate ? 
                    msg.timestamp.toDate().toLocaleTimeString() : 
                    'Just now'}
                </span>
              </div>
            </div>
            
            {/* Message Content with Embeds */}
            <div className="text-white">
              {renderMessageWithEmbeds(msg.content)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 flex-shrink-0">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isUserAdmin() 
              ? "Type your message... Twitter/X links will auto-embed! (Enter to send)"
              : "Type your message in public chat... (Enter to send)"
          }
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
          ) : isConfirming ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Confirming...
            </div>
          ) : (
            'Send'
          )}
        </button>
      </div>

      {/* Admin Help Text */}
      {isUserAdmin() && (
        <div className="mt-2 text-center text-gray-400 text-sm">
          💡 <strong>Admin Feature:</strong> Twitter/X links will automatically embed with preview
        </div>
      )}
    </section>
  );
};

export default PublicChat;