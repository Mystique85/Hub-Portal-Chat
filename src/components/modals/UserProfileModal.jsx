import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import SendHCModal from './SendHCModal'; // ← DODANY IMPORT

const UserProfileModal = ({ user, onClose, getOtherUserBalance, currentUser }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userBalance, setUserBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !user.walletAddress) return;
      
      setLoading(true);
      try {
        // 1. Pobierz pełny profil użytkownika z Firestore
        const userDoc = await getDoc(doc(db, 'users', user.walletAddress.toLowerCase()));
        const firestoreProfile = userDoc.exists() ? userDoc.data() : null;
        
        // 2. Pobierz balance z kontraktu
        let balance = '0';
        if (getOtherUserBalance) {
          balance = await getOtherUserBalance(user.walletAddress);
        }
        
        setUserProfile(firestoreProfile);
        setUserBalance(balance);
        
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user, getOtherUserBalance]);

  if (!user) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              User Profile
            </h2>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-3xl">
                {user.avatar}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-xl">{user.nickname}</div>
                <div className="text-gray-400 text-sm mt-1">
                  {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-6)}
                </div>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
              <div className="text-gray-400 mt-2">Loading profile...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* HC Balance - RZECZYWISTY BALANCE Z KONTRAKTU */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 text-center">
                <div className="text-cyan-400 font-bold text-3xl mb-2">
                  {userBalance}
                </div>
                <div className="text-cyan-300 text-sm">HC Tokens</div>
              </div>
              
              {/* User Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <div className="text-green-400 font-bold text-lg">
                    {userProfile?.totalMessages || '0'}
                  </div>
                  <div className="text-gray-400 text-xs">Total Messages</div>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <div className="text-purple-400 font-bold text-lg">
                    {userProfile?.createdAt ? 
                      new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 
                      'Unknown'
                    }
                  </div>
                  <div className="text-gray-400 text-xs">Joined</div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowSendModal(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Send HC
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Send HC */}
      {showSendModal && (
        <SendHCModal 
          user={user}
          currentUser={currentUser}
          onClose={() => setShowSendModal(false)}
          getOtherUserBalance={getOtherUserBalance}
        />
      )}
    </>
  );
};

export default UserProfileModal;