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

const SayHelloChat = ({ 
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

  const { 
    currentNetwork, 
    isCelo, 
    isBase, 
    isLinea,
    isPolygon,
    isSoneium,
    isArbitrum,
    isMonad,
    tokenSymbol 
  } = useNetwork();

  // Ustawienie kontraktu dla aktualnej sieci
  const getContractForNetwork = () => {
    if (isCelo) return CONTRACT_ADDRESSES.celo;
    if (isBase) return CONTRACT_ADDRESSES.base;
    if (isLinea) return CONTRACT_ADDRESSES.linea;
    if (isPolygon) return CONTRACT_ADDRESSES.polygon;
    if (isSoneium) return CONTRACT_ADDRESSES.soneium;
    if (isArbitrum) return CONTRACT_ADDRESSES.arbitrum;
    if (isMonad) return CONTRACT_ADDRESSES.monad;
    return null;
  };

  const getContractABI = () => {
    if (isCelo) return CONTRACT_ABIS.celo;
    if (isBase) return CONTRACT_ABIS.base;
    if (isLinea) return CONTRACT_ABIS.linea;
    if (isPolygon) return CONTRACT_ABIS.polygon;
    if (isSoneium) return CONTRACT_ABIS.soneium;
    if (isArbitrum) return CONTRACT_ABIS.arbitrum;
    if (isMonad) return CONTRACT_ABIS.monad;
    return null;
  };

  const getNetworkName = () => {
    if (isCelo) return 'Celo';
    if (isBase) return 'Base';
    if (isLinea) return 'Linea';
    if (isPolygon) return 'Polygon';
    if (isSoneium) return 'Soneium';
    if (isArbitrum) return 'Arbitrum';
    if (isMonad) return 'Monad';
    return currentNetwork;
  };

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
      
      // Filtrujemy wiadomości tylko z kanału say-hello
      const sayHelloMessages = allMessages.filter(msg => 
        msg.channel === 'say-hello'
      );
      
      setMessages(sayHelloMessages);
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
      const networkName = getNetworkName();
      
      const newMessageDoc = {
        content: messageData.content,
        nickname: messageData.nickname,
        avatar: messageData.avatar,
        avatarType: messageData.avatarType,
        walletAddress: messageData.walletAddress,
        replyTo: messageData.replyTo || null,
        channel: 'say-hello',
        timestamp: serverTimestamp(),
        network: networkName.toLowerCase()
      };

      await addDoc(collection(db, 'messages'), newMessageDoc);
      
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
      
      messageElement.classList.add('bg-green-500/20', 'border-green-500/50');
      setTimeout(() => {
        messageElement.classList.remove('bg-green-500/20', 'border-green-500/50');
      }, 2000);
    }
  };

  const sendMessage = async () => {
    const contractAddress = getContractForNetwork();
    const contractABI = getContractABI();
    
    if (!newMessage.trim() || !currentUser || !db || isSending || !contractAddress || !contractABI) {
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
        address: contractAddress,
        abi: contractABI,
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
    
    const baseText = isMobile ? "Say hello..." : "Say hello to the community! (Enter to send)";
    
    return baseText;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-400">Loading Say Hello chat...</p>
        </div>
      </div>
    );
  }

  return (
    <section className={`flex flex-col h-full min-h-0 ${isMobile ? 'p-2' : 'p-6'}`}>
      <div className={`mb-2 text-center ${isMobile ? 'p-1' : 'p-2'} bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30`}>
        <div className="flex items-baseline justify-center gap-1">
          <h2 className="text-base font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Say Hello 👋
          </h2>
          <span className="text-gray-300 text-xs">
            - Friendly community introductions & greetings
          </span>
        </div>
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden ${isMobile ? 'mb-2' : 'mb-4'}`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-center text-gray-400 ${isMobile ? 'px-4' : ''}`}>
              <div className={`${isMobile ? 'text-4xl mb-3' : 'text-6xl mb-4'}`}>👋</div>
              <p className={isMobile ? 'text-lg mb-1' : 'text-xl mb-2'}>Say Hello chat is empty</p>
              <p className={isMobile ? 'text-xs' : 'text-sm'}>
                Be the first to say hello to the community!
              </p>
              <div className="mt-4 inline-block bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg text-sm">
                💬 Perfect place for warm welcomes
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
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-3 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-green-400 text-lg flex-shrink-0">↶</span>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-green-400 text-sm font-medium truncate">
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

      <div className={`flex gap-2 bg-gray-800/50 backdrop-blur-xl border border-green-500/30 rounded-xl flex-shrink-0 ${isMobile ? 'mt-auto p-2' : 'p-4 rounded-2xl'}`}>
        <input 
          ref={messageInputRef}
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholderText()}
          disabled={isSending || !getContractForNetwork()}
          className={`flex-1 bg-transparent border-none text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
            isMobile ? 'text-sm px-2' : 'px-3'
          }`}
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending || !getContractForNetwork()}
          className={`bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ${
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
            isMobile ? '👋' : 'Send'
          )}
        </button>
      </div>
    </section>
  );
};

export default SayHelloChat;