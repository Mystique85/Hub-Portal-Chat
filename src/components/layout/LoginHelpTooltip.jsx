// src/components/layout/LoginHelpTooltip.jsx
import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translations, getBrowserLanguage } from '../../utils/translations';

const LoginHelpTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [language, setLanguage] = useState(getBrowserLanguage());
  const [currentStep, setCurrentStep] = useState(0);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (showTooltip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showTooltip]);

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const handleClose = () => {
    setShowTooltip(false);
    setCurrentStep(0);
  };

  const steps = [
    {
      id: 0,
      title: language === 'pl' ? "🌟 Dołącz do Rewolucji Web3" : "🌟 Join the Web3 Revolution",
      icon: "🌟",
      type: 'vision',
      content: language === 'pl' 
        ? `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Chat</span> to Twój pierwszy krok w przyszłość społeczności internetowych - miejscu, gdzie Twoja aktywność ma realną wartość, a nie tylko pozostaje cyfrowym śladem.</p>

            <p class="text-cyan-300 font-semibold">🎯 Twoja Aktywność = Prawdziwe Aktywa</p>
            <p>Każda wiadomość to nie tylko wymiana myśli - to mintowanie realnych tokenów <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> bezpośrednio na blockchainie Celo. Nie jesteś użytkownikiem - jesteś współtwórcą ekosystemu.</p>

            <p class="text-cyan-300 font-semibold">🚀 Od HC do HUB: Twoja Ścieżka Wartości</p>
            <p>Tokeny <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> to więcej niż nagrody - to klucz otwierający drzwi do pełni możliwości <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span>. Każdy token jest <strong>mintowany od zera</strong> z ograniczoną pulą 1,000,000 HC, co gwarantuje rzadkość i realną wartość. <strong>Żaden użytkownik nie ma przewagi</strong> - wszyscy startujemy z równymi szansami.</p>
            
            <div class="space-y-2 text-sm">
              <p>• Ekskluzywne programy airdrop głównego tokena <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB</span> dla użytkowników z największą ilością HC tokenów</p>
              <p>• Early access do kolejnych innowacyjnych dApp w ekosystemie</p>
              <p>• Specjalne nagrody i materiały edukacyjne</p>
              <p>• Unikalne możliwości w rozwijającym się portfolio projektów</p>
              <p>• Wpływ na rozwój platformy przez aktywne uczestnictwo</p>
            </div>

            <p class="text-cyan-300 font-semibold">💎 Zbuduj Swoją Web3 Tożsamość</p>
            <p>Tutaj nie jesteś anonimowym użytkownikiem - jesteś pionierem nowej ery społeczności internetowych. Twoja reputacja rośnie z każdą wiadomością, a zgromadzone tokeny to nie tylko wartość - to Twój głos w przyszłości zdecentralizowanej przestrzeni.</p>

            <p class="text-center text-white italic border-t border-gray-600/30 pt-4">Dołącz do społeczności, która nie tylko obserwuje rewolucję Web3 - ale aktywnie ją tworzy. Tutaj Twoja aktywność ma znaczenie.</p>
          </div>`
        : `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Chat</span> is your first step into the future of online communities - a place where your activity holds real value, not just digital footprints.</p>

            <p class="text-cyan-300 font-semibold">🎯 Your Activity = Real Assets</p>
            <p>Every message isn't just an exchange of thoughts - it's minting real <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> tokens directly on Celo blockchain. You're not a user - you're a co-creator of the ecosystem.</p>

            <p class="text-cyan-300 font-semibold">🚀 From HC to HUB: Your Value Pathway</p>
            <p><span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> tokens are more than rewards - they're the key unlocking full <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> potential. Each token is <strong>minted from scratch</strong> with limited supply of 1,000,000 HC, ensuring scarcity and real value. <strong>No user has advantage</strong> - we all start with equal opportunities.</p>
            
            <div class="space-y-2 text-sm">
              <p>• Exclusive airdrop programs for main <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB</span> token targeting users with highest HC token balance</p>
              <p>• Early access to upcoming innovative dApps in ecosystem</p>
              <p>• Special rewards and educational materials</p>
              <p>• Unique opportunities in growing project portfolio</p>
              <p>• Influence on platform development through active participation</p>
            </div>

            <p class="text-cyan-300 font-semibold">💎 Build Your Web3 Identity</p>
            <p>Here you're not an anonymous user - you're a pioneer of new internet community era. Your reputation grows with every message, and accumulated tokens aren't just value - they're your voice in decentralized space future.</p>

            <p class="text-center text-white italic border-t border-gray-600/30 pt-4">Join the community that doesn't just watch Web3 revolution - but actively builds it. Here your activity matters.</p>
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
            <p class="text-cyan-300 font-semibold text-center">Krok 1: Połączenie z Celo Blockchain</p>
            <div class="space-y-3 text-left">
              <p>• Kliknij <span class="text-cyan-300">"Connect Wallet"</span></p>
              <p>• Wybierz kompatybilny portfel EVM z dostępnej listy</p>
              <p>• Zaakceptuj połączenie w aplikacji portfela</p>
              <p>• Portfel automatycznie przełączy się na sieć Celo - upewnij się że jesteś na właściwej sieci</p>
              <p>• Połączenie jest w <span class="text-green-400">100% bezpieczne</span></p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 1: Connect to Celo Blockchain</p>
            <div class="space-y-3 text-left">
              <p>• Click <span class="text-cyan-300">"Connect Wallet"</span></p>
              <p>• Choose compatible EVM wallet from available list</p>
              <p>• Accept connection in your wallet app</p>
              <p>• Wallet will automatically switch to Celo network - make sure you're on correct network</p>
              <p>• Connection is <span class="text-green-400">100% secure</span></p>
            </div>
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
            <div class="space-y-3 text-left">
              <p>• Po połączeniu utwórz <span class="text-cyan-300">unikalny profil</span></p>
              <p>• Wybierz nick, którego <span class="text-cyan-300">nikt inny nie ma</span></p>
              <p>• Wybierz avatar z dostępnych emoji</p>
              <p>• Profil powiązany z adresem portfela <span class="text-cyan-300">na zawsze</span></p>
              <p>• Dane widoczne dla całej społeczności</p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 2: Build Your Web3 Profile</p>
            <div class="space-y-3 text-left">
              <p>• After connecting, create <span class="text-cyan-300">unique profile</span></p>
              <p>• Choose nickname that's <span class="text-cyan-300">unavailable to others</span></p>
              <p>• Select avatar from available emojis</p>
              <p>• Profile linked to wallet address <span class="text-cyan-300">forever</span></p>
              <p>• Data visible to entire community</p>
            </div>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 3,
      title: language === 'pl' ? "💎 Zdobywaj HC Tokeny" : "💎 Earn HC Tokens",
      icon: "💎",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Krok 3: Zacznij Zbierać HC Tokeny</p>
            <div class="space-y-3 text-left">
              <p>• <span class="text-cyan-300">1 HC token</span> za każdą wiadomość</p>
              <p>• Limit: <span class="text-cyan-300">10 HC dziennie</span> na użytkownika</p>
              <p>• Tokeny automatycznie mintowane do portfela</p>
              <p>• <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> to prawdziwe tokeny ERC-20 na Celo</p>
              <p>• Śledź zarobki w panelu użytkownika</p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 3: Start Collecting HC Tokens</p>
            <div class="space-y-3 text-left">
              <p>• <span class="text-cyan-300">1 HC token</span> per message</p>
              <p>• Limit: <span class="text-cyan-300">10 HC daily</span> per user</p>
              <p>• Tokens auto-minted to wallet</p>
              <p>• <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> are real ERC-20 tokens on Celo</p>
              <p>• Track earnings in user panel</p>
            </div>
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
            <p class="text-cyan-300 font-semibold text-center">Krok 4: Rozpocznij Czatowanie</p>
            <div class="space-y-3 text-left">
              <p>• <span class="text-cyan-300">Czat publiczny</span> - rozmowy ze wszystkimi</p>
              <p>• <span class="text-cyan-300">Czaty prywatne</span> - bezpieczne 1-na-1</p>
              <p>• <span class="text-cyan-300">Reakcje emoji</span> - wyrażaj emocje</p>
              <p>• <span class="text-cyan-300">System online</span> - zobacz aktywnych</p>
              <p>• <span class="text-cyan-300">Enter</span> - szybkie wysyłanie</p>
            </div>
            <p class="text-green-400 font-semibold text-center mt-4">Gotowy by dołączyć? Twoja podróż w <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> właśnie się zaczyna!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 4: Start Chatting</p>
            <div class="space-y-3 text-left">
              <p>• <span class="text-cyan-300">Public chat</span> - talk with everyone</p>
              <p>• <span class="text-cyan-300">Private chats</span> - secure 1-on-1</p>
              <p>• <span class="text-cyan-300">Emoji reactions</span> - express emotions</p>
              <p>• <span class="text-cyan-300">Online system</span> - see active users</p>
              <p>• <span class="text-cyan-300">Enter</span> - quick sending</p>
            </div>
            <p class="text-green-400 font-semibold text-center mt-4">Ready to join? Your <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> journey starts now!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Rozpocznij Czatowanie!' : 'Start Chatting!'
    }
  ];

  const currentStepData = steps[currentStep];

  const TooltipContent = () => {
    if (!showTooltip) return null;

    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <div 
          ref={tooltipRef}
          className="relative w-full max-w-xl bg-gray-800 border-2 border-cyan-500/30 rounded-3xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col"
          style={{ 
            height: '700px',
            maxHeight: '90vh'
          }}
        >
          <div className="bg-gray-800 border-b border-cyan-500/20 p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {language === 'pl' ? '🚀 Przewodnik Startowy' : '🚀 Quick Start Guide'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'pl' ? 'Jak rozpocząć korzystanie z HUB Portal' : 'How to start using HUB Portal'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-700/50 rounded-lg p-1 border border-gray-600/50">
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      language === 'pl' 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    PL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
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
                  className="text-gray-300 hover:text-white text-lg transition-all hover:scale-110 p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex-1 h-2 rounded-full transition-all ${
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

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                {currentStepData.icon}
              </div>
              <h2 className="text-2xl font-bold text-cyan-300 mb-2">
                {currentStepData.title}
              </h2>
            </div>

            <div 
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentStepData.content }}
            />
          </div>

          <div className="p-6 border-t border-gray-600/30 flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-300 hover:text-white hover:border-gray-500 transition-all"
              >
                ← {language === 'pl' ? 'Wstecz' : 'Back'}
              </button>
            )}
            
            <button
              onClick={currentStep === 4 ? handleClose : nextStep}
              className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-500/50 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 ${
                currentStep === 0 ? 'flex-1' : currentStep > 0 ? 'flex-1' : ''
              }`}
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
      <button
  onClick={() => setShowTooltip(true)}
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 rounded-xl text-white text-sm font-medium hover:from-cyan-500/40 hover:to-blue-500/40 hover:border-cyan-300 transition-all shadow-md hover:shadow-cyan-500/30"
>
  <span className="text-cyan-300">📚</span>
  <span>Get Started - Tutorial</span>
</button>

      <TooltipContent />
    </>
  );
};

export default LoginHelpTooltip;