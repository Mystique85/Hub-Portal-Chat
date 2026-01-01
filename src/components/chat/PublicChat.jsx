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

const PublicChat = ({ 
  currentUser, 
  onUpdateLastSeen, 
  onDeleteMessage, 
  isMobile = false, 
  onViewProfile, 
  updateUserMessageCount 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { writeContract, data: transactionHash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: transactionHash,
  });

  const { currentNetwork, isCelo, isBase, isLinea, isPolygon, isSoneium, isArbitrum, tokenSymbol } = useNetwork();

  // Twój klucz API ImgBB
  const IMGBB_API_KEY = '333afaf638c5fba6128627e19948c80c';

  useEffect(() => {
    if (!db) return;

    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(msg => 
          !msg.channel || 
          msg.channel === 'general' || 
          msg.channel === undefined
        );
      
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

  const uploadImageToImgBB = async (imageFile) => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data.url; // URL obrazu
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Błąd przesyłania obrazu:', error);
      alert('Nie udało się przesłać obrazu. Spróbuj ponownie.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Sprawdź rozmiar pliku (max 32 MB dla ImgBB)
    if (file.size > 32 * 1024 * 1024) {
      alert('Plik jest za duży. Maksymalny rozmiar to 32 MB.');
      return;
    }
    
    // Sprawdź typ pliku
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Nieprawidłowy typ pliku. Dopuszczalne: JPEG, PNG, GIF, WebP.');
      return;
    }
    
    // Utwórz podgląd
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setSelectedImage(file);
    };
    reader.readAsDataURL(file);
    
    // Wyczyść input pliku
    event.target.value = '';
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const addMessageToFirestore = async (messageData) => {
    try {
      await addDoc(collection(db, 'messages'), {
        content: messageData.content,
        nickname: messageData.nickname,
        avatar: messageData.avatar,
        avatarType: messageData.avatarType,
        walletAddress: messageData.walletAddress,
        replyTo: messageData.replyTo || null,
        channel: 'general',
        timestamp: serverTimestamp(),
        network: currentNetwork
      });
      
      if (updateUserMessageCount) {
        await updateUserMessageCount(messageData.walletAddress);
      }
      
      onUpdateLastSeen(messageData.walletAddress);
    } catch (error) {
      console.error('Error adding message to Firestore:', error);
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

  const handleScrollToMessage = (messageId) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      messageElement.classList.add('bg-cyan-500/20', 'border-cyan-500/50');
      setTimeout(() => {
        messageElement.classList.remove('bg-cyan-500/20', 'border-cyan-500/50');
      }, 2000);
    }
  };

  const sendMessage = async () => {
    // KLUCZOWA ZMIANA: Dla Base - zawsze wymagaj tekstu, dla innych - tekst LUB obrazek
    let canSend = false;
    
    if (isBase) {
      // BASE: Wymaga zawsze tekstu (jak w oryginale)
      canSend = newMessage.trim() && currentUser && db && !isSending;
    } else {
      // INNE SIECI: Tekst LUB obrazek
      canSend = (newMessage.trim() || selectedImage) && currentUser && db && !isSending;
    }
    
    if (!canSend) return;

    setIsSending(true);
    
    try {
      let finalContent = newMessage.trim();
      
      // Jeśli jest wybrany obraz, prześlij go
      if (selectedImage) {
        const imageUrl = await uploadImageToImgBB(selectedImage);
        if (imageUrl) {
          // Dodaj URL obrazka do treści
          finalContent = finalContent 
            ? `${finalContent} ${imageUrl}`
            : imageUrl;
        } else if (!finalContent && !isBase) {
          // Jeśli tylko obrazek (nie Base) i upload się nie udał - STOP
          alert('Nie udało się przesłać obrazu.');
          setIsSending(false);
          return;
        }
        // Dla Base: jeśli upload się nie uda, wysyłamy tylko tekst
      }
      
      // Dla Base: jeśli po uploadzie nie ma treści (tylko obrazek który się nie udał)
      if (isBase && !finalContent) {
        alert('Base wymaga tekstu w wiadomości. Dodaj tekst przed wysłaniem.');
        setIsSending(false);
        return;
      }
      
      const messageData = {
        content: finalContent,
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
      
      const contractConfig = {
        address: CONTRACT_ADDRESSES[currentNetwork],
        abi: CONTRACT_ABIS[currentNetwork],
        functionName: 'sendMessage',
        args: [finalContent],
      };
      
      writeContract(contractConfig);
      
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setReplyingTo(null);
      
    } catch (error) {
      console.error('Failed to send message:', error);
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
    if (replyingTo) {
      return `Reply to @${replyingTo.nickname}...`;
    }
    
    if (isMobile) {
      if (isCelo) return "Type message and earn HC...";
      if (isBase) return "Type message and earn HUB... (Text required)";
      if (isLinea) return "Type message and earn LPX...";
      if (isPolygon) return "Type message and earn MSG...";
      if (isSoneium) return "Type message and earn LUM...";
      if (isArbitrum) return "Type message and earn PORTAL...";
      return "Type message...";
    }
    
    if (isCelo) {
      return "Type your message in public chat and earn HC tokens (10 msg daily) - Enter to send";
    }
    if (isBase) {
      return "Type your message in public chat and earn HUB tokens (Free: 10 msg, Basic: 50, Premium: Unlimited) - Text required";
    }
    if (isLinea) {
      return "Type your message in public chat and earn LPX tokens (max 100 msg daily) - Enter to send";
    }
    if (isPolygon) {
      return "Type your message in public chat and earn MSG tokens (max 100 msg daily, 2-560 chars) - Enter to send";
    }
    if (isSoneium) {
      return "Type your message in public chat and earn LUM tokens (max 100 msg daily, 2-560 chars) - Enter to send";
    }
    if (isArbitrum) {
      return "Type your message in public chat and earn $ARBX tokens (max 100 msg daily)";
    }
    
    return "Type your message in public chat... (Enter to send)";
  };

  const getNetworkColor = () => {
    if (isCelo) return "from-yellow-500/10 to-yellow-500/5 border-yellow-500/30 text-yellow-400";
    if (isBase) return "from-blue-500/10 to-blue-500/5 border-blue-500/30 text-blue-400";
    if (isLinea) return "from-cyan-500/10 to-cyan-500/5 border-cyan-500/30 text-cyan-400";
    if (isPolygon) return "from-purple-500/10 to-purple-500/5 border-purple-500/30 text-purple-400";
    if (isSoneium) return "from-pink-500/10 to-pink-500/5 border-pink-500/30 text-pink-400";
    if (isArbitrum) return "from-blue-600/10 to-blue-600/5 border-blue-600/30 text-blue-500";
    return "from-cyan-500/10 to-blue-500/10 border-cyan-500/30 text-cyan-400";
  };

  const getButtonGradient = () => {
    if (isCelo) return "from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600";
    if (isBase) return "from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600";
    if (isLinea) return "from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600";
    if (isPolygon) return "from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600";
    if (isSoneium) return "from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600";
    if (isArbitrum) return "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800";
    return "from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600";
  };

  return (
    <section className={`flex flex-col h-full min-h-0 ${isMobile ? 'p-2' : 'p-6'}`}>
      <div className={`mb-2 text-center ${isMobile ? 'p-1' : 'p-2'} bg-gradient-to-r ${getNetworkColor()} rounded-lg border`}>
        <div className="flex items-baseline justify-center gap-1">
          <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Public Chat - All Networks
          </h2>
          <span className="text-xs text-gray-300">(📎 Send images)</span>
        </div>
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isMobile ? 'mb-2' : 'mb-4'}`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center text-gray-400 ${isMobile ? 'px-4' : ''}`}>
              <div className={`${isMobile ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>💬</div>
              <p className={isMobile ? 'text-lg mb-1' : 'text-xl mb-2'}>No messages yet in Public Chat</p>
              <p className={isMobile ? 'text-xs' : 'text-sm'}>Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            onReply={handleReply}
            onViewProfile={onViewProfile}
            onScrollToMessage={handleScrollToMessage}
            isMobile={isMobile}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-3 mb-3 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-cyan-400 text-lg flex-shrink-0">↶</span>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-cyan-400 text-sm font-medium truncate">
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

      {imagePreview && (
        <div className="mb-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl flex items-start gap-3">
          <div className="relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-16 h-16 object-cover rounded-lg"
            />
            <button 
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-300">Image ready to send</p>
            <p className="text-xs text-gray-400">Will be uploaded and sent with your message</p>
            {isBase && (
              <p className="text-xs text-yellow-400 mt-1">⚠️ Base requires text with image</p>
            )}
          </div>
        </div>
      )}

      <div className={`flex gap-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl flex-shrink-0 ${isMobile ? 'mt-auto p-2' : 'p-4 rounded-2xl'}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          className={`flex items-center justify-center ${isMobile ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'} ${isUploading ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          title="Add image"
        >
          {isUploading ? (
            <div className={`animate-spin rounded-full border-2 border-t-transparent ${isMobile ? 'w-5 h-5 border-cyan-400' : 'w-6 h-6 border-cyan-400'}`}></div>
          ) : (
            <span className={isMobile ? 'text-base' : 'text-lg'}>📎</span>
          )}
        </button>
        
        <input 
          ref={messageInputRef}
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholderText()}
          disabled={isSending || isUploading}
          className={`flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-0 disabled:opacity-50 ${isMobile ? 'text-sm px-2' : 'px-3'}`}
        />
        
        <button 
          onClick={sendMessage}
          // RÓŻNE WARUNKI DLA RÓŻNYCH SIECI
          disabled={
            isBase 
              ? !newMessage.trim() || isSending || isUploading  // Base: tylko tekst
              : (!newMessage.trim() && !selectedImage) || isSending || isUploading // Inne: tekst LUB obrazek
          }
          className={`bg-gradient-to-r ${getButtonGradient()} text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ${isMobile ? 'px-3 py-2 rounded-lg text-xs min-h-[36px]' : 'px-6 py-3 rounded-xl'}`}
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
          ) : isUploading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              {isMobile ? '' : 'Uploading...'}
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