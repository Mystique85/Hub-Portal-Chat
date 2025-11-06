// src/components/layout/LoginHelpTooltip.jsx
import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translations, getBrowserLanguage } from '../../utils/translations';

const LoginHelpTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [language, setLanguage] = useState(getBrowserLanguage());
  const tooltipRef = useRef(null);

  const t = translations[language];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showTooltip]);

  const loginSections = [
    {
      id: 1,
      title: language === 'pl' ? "🔗 Połącz Portfel" : "🔗 Connect Wallet",
      icon: "🔗",
      content: language === 'pl' 
        ? `• Kliknij "Connect Wallet" aby połączyć swój portfel Celo
• Upewnij się że używasz kompatybilnego portfela (MetaMask, Rainbow, itp.)
• Zaakceptuj połączenie w swoim portfelu
• Portfel musi być przełączony na sieć Celo
• Połączenie jest bezpieczne i nie udostępnia kluczy prywatnych`
        : `• Click "Connect Wallet" to connect your Celo wallet
• Make sure you're using a compatible wallet (MetaMask, Rainbow, etc.)
• Accept the connection in your wallet
• Wallet must be switched to Celo network
• Connection is secure and doesn't share private keys`
    },
    {
      id: 2,
      title: language === 'pl' ? "👤 Utwórz Profil" : "👤 Create Profile",
      icon: "👤",
      content: language === 'pl'
        ? `• Po połączeniu portfela utwórz swój profil
• Wybierz unikalny nick (nie można go później zmienić!)
• Wybierz avatar z dostępnych emoji
• Twój profil będzie powiązany z adresem portfela
• Te dane będą widoczne dla innych użytkowników`
        : `• After connecting wallet, create your profile
• Choose a unique nickname (cannot be changed later!)
• Select avatar from available emojis
• Your profile will be linked to wallet address
• This data will be visible to other users`
    },
    {
      id: 3,
      title: language === 'pl' ? "💎 Zdobywaj HC Tokeny" : "💎 Earn HC Tokens",
      icon: "💎",
      content: language === 'pl'
        ? `• Otrzymujesz 1 HC token za każdą wiadomość w czacie publicznym
• Dzienne limit: 10 HC tokenów na użytkownika
• Tokeny są automatycznie przesyłane do Twojego portfela
• HC to prawdziwe tokeny na blockchainie Celo
• Śledź swoje zarobki w prawym górnym rogu`
        : `• Earn 1 HC token for every public chat message
• Daily limit: 10 HC tokens per user
• Tokens are automatically sent to your wallet
• HC are real tokens on Celo blockchain
• Track your earnings in top right corner`
    },
    {
      id: 4,
      title: language === 'pl' ? "💬 Rozpocznij Czatowanie" : "💬 Start Chatting",
      icon: "💬",
      content: language === 'pl'
        ? `• Czat publiczny: rozmawiaj ze wszystkimi użytkownikami
• Czaty prywatne: 1-na-1 z wybranymi użytkownikami
• Reakcje: dodawaj emoji do wiadomości
• System online: zobacz kto jest aktualnie aktywny
• Używaj Enter do szybkiego wysyłania wiadomości`
        : `• Public chat: talk with all users
• Private chats: 1-on-1 with selected users
• Reactions: add emoji to messages
• Online system: see who's currently active
• Use Enter for quick message sending`
    }
  ];

  // Finalna treść vision section z airdropem
  const visionContent = {
    pl: {
      title: "💡 Rozpocznij Niezwykłą Podróż w Świecie HUB Portal",
      content: `• **HUB Chat to dopiero początek** - Twój pierwszy krok w rozwijającym się ekosystemie, który łączy social interactions z realną wartością blockchain

• **Aktywność = Nagrody** - Każda wiadomość, reakcja i zaangażowanie w czacie przynosi Ci HC tokeny. To nie puste punkty - to realne aktywa w Twoim portfelu

• **HC Tokeny - Klucz do Ekosystemu** - Zebrane tokeny otworzą Ci dostęp do exclusive funkcji całego HUB Portal:
  🗳️ Aktywne uczestnictwo w głosowaniach i decyzjach kształtujących przyszłość platformy
  📚 Premium dostęp do zaawansowanych materiałów edukacyjnych i specjalnych nagród
  🔄 Wymiana na główny token HUB - fundament całego ekosystemu
  🎯 Early access do nowych funkcji i projektów w pipeline
  🎁 **AIRDROP** - Najaktywniejsi użytkownicy z największą ilością HC otrzymają dodatkowe tokeny HUB w specjalnych airdropach!

• **Buduj Swoją Cyfrową Tożsamość** - Tutaj nie jesteś tylko anonimowym użytkownikiem. Twoja aktywność, zaangażowanie i nagromadzone HC tokeny budują Twoją reputację w społeczności Web3

• **Bądź Częścią Rewolucji** - Dołącz do społeczności, która nie tylko korzysta z technologii, ale aktywnie uczestniczy w budowaniu przyszłości decentralized social media. Tutaj Twoja aktywność ma realny wpływ na rozwój platformy`
    },
    en: {
      title: "💡 Start Your Extraordinary Journey in HUB Portal World",
      content: `• **HUB Chat is Just the Beginning** - Your first step into a growing ecosystem that blends social interactions with real blockchain value

• **Activity = Rewards** - Every message, reaction, and engagement in chat earns you HC tokens. These aren't empty points - they're real assets in your wallet

• **HC Tokens - Your Ecosystem Key** - Accumulated tokens will unlock exclusive features across HUB Portal:
  🗳️ Active participation in votes and decisions shaping the platform's future
  📚 Premium access to advanced educational materials and special rewards
  🔄 Exchange to main HUB token - the foundation of entire ecosystem
  🎯 Early access to new features and projects in pipeline
  🎁 **AIRDROP** - Most active users with highest HC balance will receive additional HUB tokens in special airdrops!

• **Build Your Digital Identity** - Here you're not just an anonymous user. Your activity, engagement, and accumulated HC tokens build your reputation in Web3 community

• **Be Part of the Revolution** - Join a community that doesn't just use technology, but actively participates in building the future of decentralized social media. Here your activity has real impact on platform development`
    }
  };

  const TooltipContent = () => {
    if (!showTooltip) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowTooltip(false)}
        />
        
        <div 
          ref={tooltipRef}
          className="relative w-full max-w-2xl bg-gray-800 border-2 border-cyan-500/40 rounded-3xl shadow-2xl animate-in zoom-in duration-300 max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gray-800 border-b border-cyan-500/30 p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                  {language === 'pl' ? '🚀 Przewodnik Startowy' : '🚀 Quick Start Guide'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {language === 'pl' ? 'Jak rozpocząć korzystanie z HUB Portal' : 'How to start using HUB Portal'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Language Toggle */}
                <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1 border border-gray-600/50">
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      language === 'pl' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    PL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      language === 'en' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-white text-lg transition-all hover:scale-110 p-2"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Sekcje instrukcji */}
            <div className="space-y-4 mb-6">
              {loginSections.map((section) => (
                <div 
                  key={section.id}
                  className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-5 transition-all hover:border-cyan-500/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center text-lg">
                      {section.icon}
                    </div>
                    <h4 className="text-cyan-400 font-semibold text-lg">
                      {section.title}
                    </h4>
                  </div>
                  <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                    {section.content.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1 text-xs">•</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Vision Section z airdropem */}
            <div className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
              <h4 className="text-purple-400 font-semibold text-lg mb-4">
                {visionContent[language].title}
              </h4>
              <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                {visionContent[language].content.split('\n\n').map((paragraph, pIndex) => (
                  <div key={pIndex} className="space-y-2">
                    {paragraph.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className="flex items-start gap-2">
                        {line.startsWith('  ') ? (
                          <>
                            <span className="text-purple-400 mt-1 text-lg">{line.trim().charAt(0)}</span>
                            <span className="flex-1">{line.trim().substring(1)}</span>
                          </>
                        ) : line.startsWith('• **') ? (
                          <strong className="text-cyan-300 block w-full">
                            {line.replace('• **', '').replace('**', '')}
                          </strong>
                        ) : line.startsWith('•') ? (
                          <>
                            <span className="text-cyan-400 mt-1 text-xs">•</span>
                            <span className="flex-1">{line.substring(1)}</span>
                          </>
                        ) : (
                          <span className="block w-full">{line}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Help Trigger Button */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 text-sm hover:text-white hover:border-cyan-500/50 transition-all transform hover:scale-105"
      >
        <span className="text-sm">❓</span>
        <span>Quick Start</span>
      </button>

      <TooltipContent />
    </>
  );
};

export default LoginHelpTooltip;