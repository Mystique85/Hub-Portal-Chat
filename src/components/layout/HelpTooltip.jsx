import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translations, getBrowserLanguage } from '../../utils/translations';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useAccount } from 'wagmi';

const HelpTooltip = ({ isMobile = false, showButton = true, isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState(getBrowserLanguage());
  const tooltipRef = useRef(null);
  const { address } = useAccount();

  const showTooltip = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase());

  const steps = [
    {
      id: 0,
      title: language === 'pl' ? "🌟 Dołącz do Rewolucji Web3" : "🌟 Join the Web3 Revolution",
      icon: "🌟",
      type: 'vision',
      content: language === 'pl' 
        ? `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Portal</span> to pierwsza na świecie społeczność Web3, która łączy realne zarobki z komunikacją w czasie rzeczywistym na dwóch sieciach blockchain!</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base</p>
            <p>Działamy na dwóch sieciach blockchain! Na <span class="text-yellow-300">Celo</span> zdobywasz tokeny <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span>, a na <span class="text-blue-300">Base</span> zarabiasz główne tokeny <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB</span> ekosystemu.</p>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">💎 Co nas wyróżnia?</p>
              <div class="space-y-2">
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Szybkie nagrody</span> - tokeny trafiają bezpośrednio do portfela</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Dwa ekosystemy</span> - zarabiaj na Celo i Base jednocześnie</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Prawdziwa własność</span> - Twoje tokeny, Twoja kontrola</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Bezpieczeństwo</span> - audytowane smart kontrakty</p>
              </div>
            </div>

            <p class="text-center text-white italic border-t border-gray-600/30 pt-4 mt-4">Dołącz do społeczności, która nie tylko obserwuje rewolucję Web3 - ale aktywnie ją tworzy.</p>
          </div>`
        : `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Portal</span> is the world's first Web3 community combining real earnings with real-time communication on two blockchain networks!</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base</p>
            <p>We operate on two blockchain networks! On <span class="text-yellow-300">Celo</span> you earn <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> tokens, while on <span class="text-blue-300">Base</span> you collect main <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB</span> ecosystem tokens.</p>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">💎 What Makes Us Unique?</p>
              <div class="space-y-2">
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Fast Rewards</span> - tokens go directly to your wallet</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Dual Ecosystems</span> - earn on Celo and Base simultaneously</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">True Ownership</span> - your tokens, your control</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Security</span> - audited smart contracts</p>
              </div>
            </div>

            <p class="text-center text-white italic border-t border-gray-600/30 pt-4 mt-4">Join the community that doesn't just watch Web3 revolution - but actively builds it.</p>
          </div>`,
      buttonText: language === 'pl' ? 'Rozpocznij Podróż →' : 'Start Journey →'
    },
    {
      id: 1,
      title: language === 'pl' ? "🔗 Połącz Portfel" : "🔗 Connect Wallet",
      icon: "🔗",
      type: 'step',
      content: language === 'pl' 
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Krok 1: Połączenie z Blockchain</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-green-400">1.</span> Kliknij <span class="text-cyan-300 font-semibold">"Connect Wallet"</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">2.</span> Wybierz kompatybilny portfel EVM</p>
              <p class="flex items-center gap-2"><span class="text-green-400">3.</span> Portfel automatycznie przełączy się na odpowiednią sieć</p>
              <p class="flex items-center gap-2"><span class="text-green-400">4.</span> <span class="text-green-400">Wspierane sieci:</span> Celo i Base</p>
              <p class="flex items-center gap-2"><span class="text-green-400">5.</span> Połączenie jest w <span class="text-green-400 font-semibold">100% bezpieczne</span></p>
            </div>
            <p class="text-yellow-300 text-sm text-center mt-4">💡 Możesz zmieniać sieci w aplikacji jednym kliknięciem!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 1: Connect to Blockchain</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-green-400">1.</span> Click <span class="text-cyan-300 font-semibold">"Connect Wallet"</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">2.</span> Choose compatible EVM wallet</p>
              <p class="flex items-center gap-2"><span class="text-green-400">3.</span> Wallet will auto-switch to correct network</p>
              <p class="flex items-center gap-2"><span class="text-green-400">4.</span> <span class="text-green-400">Supported networks:</span> Celo and Base</p>
              <p class="flex items-center gap-2"><span class="text-green-400">5.</span> Connection is <span class="text-green-400 font-semibold">100% secure</span></p>
            </div>
            <p class="text-yellow-300 text-sm text-center mt-4">💡 You can switch networks in the app with one click!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 2,
      title: language === 'pl' ? "👤 Utwórz Profil" : "👤 Create Profile",
      icon: "👤",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Krok 2: Zbuduj Swój Profil Web3</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-green-400">1.</span> Po połączeniu utwórz <span class="text-cyan-300 font-semibold">unikalny profil</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">2.</span> Wybierz nick, którego <span class="text-cyan-300">nikt inny nie ma</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">3.</span> Wybierz avatar z dostępnych emoji</p>
              <p class="flex items-center gap-2"><span class="text-green-400">4.</span> Profil powiązany z adresem portfela <span class="text-cyan-300 font-semibold">na zawsze</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">5.</span> Dane widoczne dla całej społeczności</p>
              <p class="flex items-center gap-2"><span class="text-green-400">6.</span> Jeden profil działa na obu sieciach!</p>
            </div>
            <p class="text-yellow-300 text-sm text-center mt-4">💡 Twój profil to Twoja cyfrowa tożsamość w Web3!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 2: Build Your Web3 Profile</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-green-400">1.</span> After connecting, create <span class="text-cyan-300 font-semibold">unique profile</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">2.</span> Choose nickname that's <span class="text-cyan-300">unavailable to others</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">3.</span> Select avatar from available emojis</p>
              <p class="flex items-center gap-2"><span class="text-green-400">4.</span> Profile linked to wallet address <span class="text-cyan-300 font-semibold">forever</span></p>
              <p class="flex items-center gap-2"><span class="text-green-400">5.</span> Data visible to entire community</p>
              <p class="flex items-center gap-2"><span class="text-green-400">6.</span> One profile works on both networks!</p>
            </div>
            <p class="text-yellow-300 text-sm text-center mt-4">💡 Your profile is your digital identity in Web3!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 3,
      title: language === 'pl' ? "💎 System Nagród" : "💎 Rewards System",
      icon: "💎",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Nowy System Nagród na Base Network</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK (Klasyczny)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-cyan-300">10 HC dziennie</span></p>
                <p>• Dodatkowe codzienne nagrody CELO</p>
                <p>• Natychmiastowe dostarczanie tokenów</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK (Nowy System)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> za każdą wiadomość</p>
                <p>• <strong class="text-cyan-300">System subskrypcji:</strong></p>
                <p class="ml-4">🎯 <span class="text-green-400">FREE</span>: 10 wiadomości/dzień</p>
                <p class="ml-4">🚀 <span class="text-blue-400">BASIC</span>: 50 wiadomości/dzień (10 USDC/miesiąc)</p>
                <p class="ml-4">👑 <span class="text-purple-400">PREMIUM</span>: Nielimitowane (50 USDC/miesiąc)</p>
                <p>• Codzienne nagrody USDC dostępne dla wszystkich</p>
              </div>
            </div>

            <p class="text-yellow-300 text-sm text-center">💡 Wybierz sieć w aplikacji by przełączać między systemami!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">New Rewards System on Base Network</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK (Classic)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">10 HC daily</span></p>
                <p>• Additional daily CELO rewards</p>
                <p>• Instant token delivery</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK (New System)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> per message</p>
                <p>• <strong class="text-cyan-300">Subscription System:</strong></p>
                <p class="ml-4">🎯 <span class="text-green-400">FREE</span>: 10 messages/day</p>
                <p class="ml-4">🚀 <span class="text-blue-400">BASIC</span>: 50 messages/day (10 USDC/month)</p>
                <p class="ml-4">👑 <span class="text-purple-400">PREMIUM</span>: Unlimited (50 USDC/month)</p>
                <p>• Daily USDC rewards available for everyone</p>
              </div>
            </div>

            <p class="text-yellow-300 text-sm text-center">💡 Choose network in app to switch between systems!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 4,
      title: language === 'pl' ? "💬 Rozpocznij Czatowanie" : "💬 Start Chatting",
      icon: "💬",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Krok 4: Funkcje Czatu i Wskazówki</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-cyan-300">💬</span> <span class="font-semibold">Czat publiczny</span> - rozmawiaj ze społecznością</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🔒</span> <span class="font-semibold">Czaty prywatne</span> - bezpieczne rozmowy 1-na-1</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">⚡</span> <span class="font-semibold">Real-time sync</span> - wiadomości na wszystkich urządzeniach</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🌐</span> <span class="font-semibold">Przełączanie sieci</span> - zarabiaj na Celo i Base</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">👥</span> <span class="font-semibold">Lista użytkowników</span> - zobacz kto jest online</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🎯</span> <span class="font-semibold">Limit dzienny</span> - śledź swoje postępy</p>
            </div>

            ${isAdmin ? `
            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">👑 Funkcje Admina (Tylko dla Ciebie)</p>
              <div class="space-y-2">
                <p class="flex items-center gap-2"><span class="text-purple-400">🔗</span> <span class="font-semibold">Formatowanie linków:</span></p>
                <p class="ml-4 text-xs">[tweet|Tekst|https://x.com] → 📢 Tekst</p>
                <p class="ml-4 text-xs">[video|Tekst|https://youtube.com] → 🎥 Tekst</p>
                <p class="ml-4 text-xs">[doc|Tekst|https://docs.com] → 📄 Tekst</p>
              </div>
            </div>
            ` : ''}

            <p class="text-green-400 font-semibold text-center mt-4">Gotowy by dołączyć? Twoja podróż w <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> właśnie się zaczyna!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 4: Chat Features & Tips</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-cyan-300">💬</span> <span class="font-semibold">Public chat</span> - talk with community</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🔒</span> <span class="font-semibold">Private chats</span> - secure 1-on-1 conversations</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">⚡</span> <span class="font-semibold">Real-time sync</span> - messages on all devices</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🌐</span> <span class="font-semibold">Network switching</span> - earn on Celo and Base</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">👥</span> <span class="font-semibold">User list</span> - see who's online</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🎯</span> <span class="font-semibold">Daily limit</span> - track your progress</p>
            </div>

            ${isAdmin ? `
            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">👑 Admin Features (Only for You)</p>
              <div class="space-y-2">
                <p class="flex items-center gap-2"><span class="text-purple-400">🔗</span> <span class="font-semibold">Link Formatting:</span></p>
                <p class="ml-4 text-xs">[tweet|Text|https://x.com] → 📢 Text</p>
                <p class="ml-4 text-xs">[video|Text|https://youtube.com] → 🎥 Text</p>
                <p class="ml-4 text-xs">[doc|Text|https://docs.com] → 📄 Text</p>
              </div>
            </div>
            ` : ''}

            <p class="text-green-400 font-semibold text-center mt-4">Ready to join? Your <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> journey starts now!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Rozpocznij Czatowanie!' : 'Start Chatting!'
    }
  ];

  const currentStepData = steps[currentStep];

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    setCurrentStep(0);
  };

  useEffect(() => {
    if (showTooltip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showTooltip]);

  const toggleLanguageHandler = () => {
    setLanguage(prev => prev === 'pl' ? 'en' : 'pl');
  };

  const TooltipContent = () => {
    if (!showTooltip) return null;

    return ReactDOM.createPortal(
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <div 
          ref={tooltipRef}
          className={`relative w-full ${
            isMobile ? 'max-w-sm' : 'max-w-xl'
          } bg-gray-800 border-2 border-cyan-500/30 rounded-3xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col`}
          style={{ 
            height: isMobile ? '600px' : '700px',
            maxHeight: '90vh'
          }}
        >
          <div className={`bg-gray-800 border-b border-cyan-500/20 ${
            isMobile ? 'p-4' : 'p-6'
          } flex-shrink-0`}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
              <div>
                <h3 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent ${
                  isMobile ? 'text-lg' : 'text-2xl'
                }`}>
                  {language === 'pl' ? '🚀 Kompletny Przewodnik' : '🚀 Complete Guide'}
                </h3>
                <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {language === 'pl' ? 'Jak korzystać z HUB Portal' : 'How to use HUB Portal'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 bg-gray-700/50 rounded-lg p-1 border border-gray-600/50 ${
                  isMobile ? 'text-xs' : ''
                }`}>
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`${
                      isMobile ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
                    } rounded font-medium transition-all ${
                      language === 'pl' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    PL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`${
                      isMobile ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
                    } rounded font-medium transition-all ${
                      language === 'en' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className={`text-gray-300 hover:text-white transition-all hover:scale-110 ${
                    isMobile ? 'text-lg p-1' : 'text-xl p-2'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-cyan-500' 
                      : index < currentStep 
                        ? 'bg-cyan-500/50' 
                        : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className={`flex-1 ${isMobile ? 'p-4' : 'p-6'} overflow-y-auto`}>
            <div className={`text-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <div className={`${
                isMobile ? 'w-12 h-12 text-xl rounded-xl' : 'w-16 h-16 text-2xl rounded-2xl'
              } ${
                currentStepData.type === 'vision' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20' 
                  : 'bg-cyan-500/20'
              } flex items-center justify-center mx-auto ${isMobile ? 'mb-3' : 'mb-4'}`}>
                {currentStepData.icon}
              </div>
              <h2 className={`font-bold text-cyan-300 ${
                isMobile ? 'text-lg mb-1' : 'text-2xl mb-2'
              }`}>
                {currentStepData.title}
              </h2>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {language === 'pl' ? `Krok ${currentStep + 1} z ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
              </p>
            </div>

            <div 
              className={`leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
              dangerouslySetInnerHTML={{ __html: currentStepData.content }}
            />
          </div>

          <div className={`border-t border-gray-600/30 ${
            isMobile ? 'p-3' : 'p-6'
          } flex gap-2`}>
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className={`${
                  isMobile ? 'px-3 py-2 text-xs' : 'px-4 py-3'
                } flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 hover:text-white hover:border-gray-500 transition-all`}
              >
                ← {language === 'pl' ? 'Wstecz' : 'Back'}
              </button>
            )}
            
            <button
              onClick={currentStep === steps.length - 1 ? handleClose : nextStep}
              className={`${
                isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'
              } ${
                currentStep === 0 ? 'flex-1' : 'flex-1'
              } bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-500/50 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105`}
            >
              {currentStepData.buttonText}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {showButton && !showTooltip && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className={`flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-cyan-500/30 ${
            isMobile ? 'px-3 py-1.5 text-xs gap-1' : 'px-4 py-2 text-sm'
          }`}
        >
          <span className={isMobile ? 'text-sm' : 'text-sm'}>📚</span>
          <span>{isMobile ? 'Guide' : 'Complete Guide'}</span>
        </button>
      )}

      <TooltipContent />
    </>
  );
};

export default HelpTooltip;