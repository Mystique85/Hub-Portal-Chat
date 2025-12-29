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

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base + Linea + Polygon</p>
            <p>Działamy na czterech sieciach blockchain! Na <span class="text-yellow-300">Celo</span> zdobywasz tokeny <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span>, na <span class="text-blue-300">Base</span> zarabiasz główne tokeny <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB</span> ekosystemu, na <span class="text-blue-400">Linea</span> zdobywasz tokeny <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">LPX</span>, a na <span class="text-purple-300">Polygon</span> zdobywasz tokeny <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">MSG</span>.</p>

            <p class="text-cyan-300 font-semibold">🚀 Potrójny System Nagród</p>
            <p><span class="text-yellow-300">📱 CELO NETWORK:</span><br/>
            • Mintujesz <span class="text-cyan-300">HC tokeny</span> za wiadomości<br/>
            • Limit 10 nagród dziennie<br/>
            • System sezonów i leaderboard</p>

            <p><span class="text-blue-300">🌉 BASE NETWORK:</span><br/>
            • Zdobywasz główne <span class="text-purple-300">HUB tokeny</span><br/>
            • <strong>System subskrypcji</strong> - bez limitów dla PREMIUM<br/>
            • Staking i dodatkowe nagrody</p>

            <p><span class="text-cyan-300">🔷 LINEA NETWORK:</span><br/>
            • Zdobywasz <span class="text-cyan-300">LPX tokeny</span><br/>
            • Generous limit: <span class="text-cyan-300">100 nagród dziennie</span><br/>
            • Daily GM Challenge z on-chain streakami</p>

            <p><span class="text-purple-300">🔶 POLYGON NETWORK:</span><br/>
            • Zdobywasz <span class="text-purple-300">MSG tokeny</span><br/>
            • Message Protocol z nagrodami za aktywność<br/>
            • Daily GM Challenge z on-chain streakami</p>

            <p class="text-cyan-300 font-semibold">💎 Zbuduj Swoją Web3 Tożsamość</p>
            <p>Tutaj nie jesteś anonimowym użytkownikiem - jesteś pionierem nowej ery społeczności internetowych. Twoja reputacja rośnie z każdą wiadomością, a zgromadzone tokeny to nie tylko wartość - to Twój głos w przyszłości zdecentralizowanej przestrzeni.</p>

            <p class="text-center text-white italic border-t border-gray-600/30 pt-4">Dołącz do społeczności, która nie tylko obserwuje rewolucję Web3 - ale aktywnie ją tworzy. Tutaj Twoja aktywność ma znaczenie.</p>
          </div>`
        : `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Chat</span> is your first step into the future of online communities - a place where your activity holds real value, not just digital footprints.</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base + Linea + Polygon</p>
            <p>We operate on four blockchain networks! On <span class="text-yellow-300">Celo</span> you earn <span class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">HC</span> tokens, on <span class="text-blue-300">Base</span> you collect main <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB</span> ecosystem tokens, on <span class="text-blue-400">Linea</span> you earn <span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">LPX</span> tokens, and on <span class="text-purple-300">Polygon</span> you earn <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">MSG</span> tokens.</p>

            <p class="text-cyan-300 font-semibold">🚀 Quad Reward System</p>
            <p><span class="text-yellow-300">📱 CELO NETWORK:</span><br/>
            • Mint <span class="text-cyan-300">HC tokens</span> for messages<br/>
            • 10 rewards daily limit<br/>
            • Season system and leaderboard</p>

            <p><span class="text-blue-300">🌉 BASE NETWORK:</span><br/>
            • Earn main <span class="text-purple-300">HUB tokens</span><br/>
            • <strong>Subscription system</strong> - unlimited for PREMIUM<br/>
            • Staking and additional rewards</p>

            <p><span class="text-cyan-300">🔷 LINEA NETWORK:</span><br/>
            • Earn <span class="text-cyan-300">LPX tokens</span><br/>
            • Generous limit: <span class="text-cyan-300">100 rewards daily</span><br/>
            • Daily GM Challenge with on-chain streaks</p>

            <p><span class="text-purple-300">🔶 POLYGON NETWORK:</span><br/>
            • Earn <span class="text-purple-300">MSG tokens</span><br/>
            • Message Protocol with activity rewards<br/>
            • Daily GM Challenge with on-chain streaks</p>

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
            <p class="text-cyan-300 font-semibold text-center">Krok 1: Połączenie z Blockchain</p>
            <div class="space-y-3 text-left">
              <p>• Kliknij <span class="text-cyan-300">"Connect Wallet"</span></p>
              <p>• Wybierz kompatybilny portfel EVM</p>
              <p>• Portfel automatycznie przełączy się na odpowiednią sieć</p>
              <p>• <span class="text-green-400">Wspierane sieci:</span> Celo, Base, Linea i Polygon</p>
              <p>• Połączenie jest w <span class="text-green-400">100% bezpieczne</span></p>
              <p class="text-yellow-300 text-sm">💡 Możesz zmieniać sieci w aplikacji!</p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 1: Connect to Blockchain</p>
            <div class="space-y-3 text-left">
              <p>• Click <span class="text-cyan-300">"Connect Wallet"</span></p>
              <p>• Choose compatible EVM wallet</p>
              <p>• Wallet will auto-switch to correct network</p>
              <p>• <span class="text-green-400">Supported networks:</span> Celo, Base, Linea and Polygon</p>
              <p>• Connection is <span class="text-green-400">100% secure</span></p>
              <p class="text-yellow-300 text-sm">💡 You can switch networks in the app!</p>
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
              <p>• Jeden profil działa na wszystkich czterech sieciach!</p>
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
              <p>• One profile works on all four networks!</p>
            </div>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 3,
      title: language === 'pl' ? "💎 Wybierz Sieć i Zdobywaj Tokeny" : "💎 Choose Network & Earn Tokens",
      icon: "💎",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Krok 3: Multi-Chain Token Rewards</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-cyan-300">10 HC dziennie</span></p>
                <p>• System sezonów i leaderboard</p>
                <p>• Tokeny mintowane bezpośrednio na blockchain</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> za każdą wiadomość</p>
                <p>• <strong class="text-cyan-300">System subskrypcji:</strong></p>
                <p class="ml-4">🎯 <span class="text-green-400">FREE</span>: 10 wiadomości/dzień</p>
                <p class="ml-4">🚀 <span class="text-blue-400">BASIC</span>: 50 wiadomości/dzień</p>
                <p class="ml-4">👑 <span class="text-purple-400">PREMIUM</span>: Nielimitowane</p>
                <p>• Staking i dodatkowe nagrody</p>
              </div>
            </div>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🔷 LINEA NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 LPX token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-cyan-300">100 LPX dziennie</span></p>
                <p>• Daily GM Challenge z on-chain streakami</p>
                <p>• Advanced anti-spam features</p>
              </div>
            </div>

            <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p class="text-purple-300 font-semibold text-center mb-2">🔶 POLYGON NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 MSG token</span> za każdą wiadomość</p>
                <p>• Message Protocol z nagrodami za aktywność</p>
                <p>• Daily GM Challenge z on-chain streakami</p>
                <p>• Token mining za każdą wiadomość</p>
              </div>
            </div>

            <p class="text-yellow-300 text-sm text-center mt-4">💡 Przełączaj sieci w aplikacji aby maksymalizować zarobki!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 3: Multi-Chain Token Rewards</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">10 HC daily</span></p>
                <p>• Season system and leaderboard</p>
                <p>• Tokens minted directly on blockchain</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> per message</p>
                <p>• <strong class="text-cyan-300">Subscription System:</strong></p>
                <p class="ml-4">🎯 <span class="text-green-400">FREE</span>: 10 messages/day</p>
                <p class="ml-4">🚀 <span class="text-blue-400">BASIC</span>: 50 messages/day</p>
                <p class="ml-4">👑 <span class="text-purple-400">PREMIUM</span>: Unlimited</p>
                <p>• Staking and additional rewards</p>
              </div>
            </div>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🔷 LINEA NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 LPX token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">100 LPX daily</span></p>
                <p>• Daily GM Challenge with on-chain streaks</p>
                <p>• Advanced anti-spam features</p>
              </div>
            </div>

            <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p class="text-purple-300 font-semibold text-center mb-2">🔶 POLYGON NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 MSG token</span> per message</p>
                <p>• Message Protocol with activity rewards</p>
                <p>• Daily GM Challenge with on-chain streaks</p>
                <p>• Token mining for every message</p>
              </div>
            </div>

            <p class="text-yellow-300 text-sm text-center mt-4">💡 Switch networks in the app to maximize your earnings!</p>
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
              <p class="text-yellow-300">💡 Zmieniaj sieci (Celo/Base/Linea/Polygon) by maksymalizować zarobki!</p>
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
              <p class="text-yellow-300">💡 Switch networks (Celo/Base/Linea/Polygon) to maximize your earnings!</p>
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