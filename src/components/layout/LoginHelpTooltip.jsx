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
    setCurrentStep(prev => Math.min(prev + 1, 5));
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
            <p><span class="text-cyan-300 font-semibold">HUB Chat</span> to Twój pierwszy krok w przyszłość społeczności internetowych - miejscu, gdzie Twoja aktywność ma realną wartość.</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base + Linea + Polygon + Soneium</p>
            <p>Działamy na pięciu sieciach blockchain! Na <span class="text-yellow-300">Celo</span> zdobywasz tokeny <span class="text-cyan-300">HC</span>, na <span class="text-blue-300">Base</span> tokeny <span class="text-purple-300">HUB</span>, na <span class="text-cyan-300">Linea</span> tokeny <span class="text-blue-300">LPX</span>, na <span class="text-purple-300">Polygon</span> tokeny <span class="text-purple-300">MSG</span>, a na <span class="text-pink-300">Soneium</span> tokeny <span class="text-pink-300">LUM</span>.</p>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mt-4">
              <p class="text-cyan-300 font-semibold text-center mb-2">💰 Opłaty Sieciowe</p>
              <p class="text-sm">Każda wysłana wiadomość wymaga standardowej opłaty transakcyjnej (gas fee) na odpowiedniej sieci blockchain. To naturalny koszt używania zdecentralizowanej infrastruktury.</p>
            </div>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">🚀 Buduj z Nami HUB Ecosystem</p>
              <p class="text-sm">Im więcej tokenów zdobywasz i im bardziej angażujesz się w społeczność, tym lepszą pozycję zdobywasz dla przyszłych airdropów w HUB Ecosystem.</p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Chat</span> is your first step into the future of online communities - a place where your activity holds real value.</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base + Linea + Polygon + Soneium</p>
            <p>We operate on five blockchain networks! On <span class="text-yellow-300">Celo</span> you earn <span class="text-cyan-300">HC</span> tokens, on <span class="text-blue-300">Base</span> you collect <span class="text-purple-300">HUB</span> tokens, on <span class="text-cyan-300">Linea</span> you earn <span class="text-blue-300">LPX</span> tokens, on <span class="text-purple-300">Polygon</span> you earn <span class="text-purple-300">MSG</span> tokens, and on <span class="text-pink-300">Soneium</span> you earn <span class="text-pink-300">LUM</span> tokens.</p>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mt-4">
              <p class="text-cyan-300 font-semibold text-center mb-2">💰 Network Fees</p>
              <p class="text-sm">Every sent message requires a standard transaction fee (gas fee) on the respective blockchain network. This is a natural cost of using decentralized infrastructure.</p>
            </div>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">🚀 Build HUB Ecosystem With Us</p>
              <p class="text-sm">The more tokens you earn and the more engaged you are in the community, the better position you secure for future airdrops in HUB Ecosystem.</p>
            </div>
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
              <p>• <span class="text-green-400">Wspierane sieci:</span> Celo, Base, Linea, Polygon, Soneium</p>
              <p>• Połączenie jest w <span class="text-green-400">100% bezpieczne</span></p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 1: Connect to Blockchain</p>
            <div class="space-y-3 text-left">
              <p>• Click <span class="text-cyan-300">"Connect Wallet"</span></p>
              <p>• Choose compatible EVM wallet</p>
              <p>• Wallet will auto-switch to correct network</p>
              <p>• <span class="text-green-400">Supported networks:</span> Celo, Base, Linea, Polygon, Soneium</p>
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
              <p>• Jeden profil działa na wszystkich pięciu sieciach!</p>
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
              <p>• One profile works on all five networks!</p>
            </div>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 3,
      title: language === 'pl' ? "💎 Zdobywaj Tokeny" : "💎 Earn Tokens",
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
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> za każdą wiadomość</p>
                <p>• System subskrypcji: FREE (10/dzień), BASIC (50/dzień), PREMIUM (nielimitowane)</p>
                <p>• Staking i dodatkowe nagrody</p>
              </div>
            </div>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🔷 LINEA NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 LPX token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-cyan-300">100 LPX dziennie</span></p>
              </div>
            </div>

            <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
              <p class="text-purple-300 font-semibold text-center mb-2">🔶 POLYGON NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 MSG token</span> za każdą wiadomość</p>
                <p>• Message Protocol z nagrodami za aktywność</p>
                <p>• Token mining za każdą wiadomość</p>
              </div>
            </div>

            <div class="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mb-3">
              <p class="text-pink-300 font-semibold text-center mb-2">🌟 SONEIUM NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-pink-300">1 LUM token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-pink-300">100 LUM dziennie</span></p>
                <p>• Soneium Score system z leaderboard</p>
              </div>
            </div>

            <div class="bg-gray-700/50 border border-gray-600/50 rounded-xl p-3 mt-4">
              <p class="text-gray-300 text-sm text-center">💰 Każda wysłana wiadomość wymaga standardowej opłaty sieciowej (gas fee).</p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 3: Multi-Chain Token Rewards</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">10 HC daily</span></p>
                <p>• Season system and leaderboard</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> per message</p>
                <p>• Subscription system: FREE (10/day), BASIC (50/day), PREMIUM (unlimited)</p>
                <p>• Staking and additional rewards</p>
              </div>
            </div>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🔷 LINEA NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 LPX token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">100 LPX daily</span></p>
              </div>
            </div>

            <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
              <p class="text-purple-300 font-semibold text-center mb-2">🔶 POLYGON NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 MSG token</span> per message</p>
                <p>• Message Protocol with activity rewards</p>
                <p>• Token mining for every message</p>
              </div>
            </div>

            <div class="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mb-3">
              <p class="text-pink-300 font-semibold text-center mb-2">🌟 SONEIUM NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-pink-300">1 LUM token</span> per message</p>
                <p>• Limit: <span class="text-pink-300">100 LUM daily</span></p>
                <p>• Soneium Score system with leaderboard</p>
              </div>
            </div>

            <div class="bg-gray-700/50 border border-gray-600/50 rounded-xl p-3 mt-4">
              <p class="text-gray-300 text-sm text-center">💰 Every sent message requires a standard network fee (gas fee).</p>
            </div>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 4,
      title: language === 'pl' ? "🔥 Daily GM Challenge" : "🔥 Daily GM Challenge",
      icon: "🔥",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Daily GM Challenge na 5 Sieciach</p>
            
            <div class="space-y-3">
              <p>• <span class="text-yellow-300">Celo:</span> Daily GM Challenge</p>
              <p>• <span class="text-blue-300">Base:</span> Daily GM Challenge</p>
              <p>• <span class="text-cyan-300">Linea:</span> Daily GM Challenge</p>
              <p>• <span class="text-purple-300">Polygon:</span> Daily GM Challenge</p>
              <p>• <span class="text-pink-300">Soneium:</span> Daily GM Challenge</p>
            </div>

            <div class="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 mt-4">
              <p class="text-orange-300 font-semibold text-center mb-2">🎯 Jak Działa Daily GM?</p>
              <div class="space-y-2 text-sm">
                <p>1. <strong>Wyślij swoją codzienną GM</strong> aby utrzymać streak</p>
                <p>2. <strong>Streak kontynuuje się</strong> jeśli GM w ciągu 24h</p>
                <p>3. <strong>Miniesz 24h?</strong> Twój streak resetuje się do 1</p>
                <p>4. <strong>Dłuższy streak = więcej aktywności!</strong></p>
              </div>
            </div>

            <div class="bg-gray-700/50 border border-gray-600/50 rounded-xl p-3 mt-4">
              <p class="text-gray-300 text-sm text-center">💡 Pamiętaj: Każda transakcja GM wymaga opłaty sieciowej (gas fee).</p>
            </div>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Daily Challenge on 5 Networks</p>
            
            <div class="space-y-3">
              <p>• <span class="text-yellow-300">Celo:</span> Daily GM Challenge</p>
              <p>• <span class="text-blue-300">Base:</span> Daily GM Challenge</p>
              <p>• <span class="text-cyan-300">Linea:</span> Daily GM Challenge</p>
              <p>• <span class="text-purple-300">Polygon:</span> Daily GM Challenge</p>
              <p>• <span class="text-pink-300">Soneium:</span> Daily GM Challenge</p>
            </div>

            <div class="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 rounded-xl p-4 mt-4">
              <p class="text-orange-300 font-semibold text-center mb-2">🎯 How Daily GM Works?</p>
              <div class="space-y-2 text-sm">
                <p>1. <strong>Send your daily GM</strong> to keep your streak alive</p>
                <p>2. <strong>Streak continues</strong> if you GM within 24h window</p>
                <p>3. <strong>Miss 24h?</strong> Your streak resets to 1</p>
                <p>4. <strong>Longer streak = more activity!</strong></p>
              </div>
            </div>

            <div class="bg-gray-700/50 border border-gray-600/50 rounded-xl p-3 mt-4">
              <p class="text-gray-300 text-sm text-center">💡 Remember: Every GM transaction requires network fee (gas fee).</p>
            </div>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 5,
      title: language === 'pl' ? "💬 Rozpocznij Czatowanie" : "💬 Start Chatting",
      icon: "💬",
      type: 'step',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Krok 5: Rozpocznij Czatowanie</p>
            <div class="space-y-3 text-left">
              <p>• <span class="text-cyan-300">Czat publiczny</span> - rozmowy ze wszystkimi</p>
              <p>• <span class="text-cyan-300">System online</span> - zobacz aktywnych</p>
              <p>• <span class="text-cyan-300">Enter</span> - szybkie wysyłanie</p>
            </div>

            <div class="bg-gray-700/50 border border-gray-600/50 rounded-xl p-3 mt-4">
              <p class="text-gray-300 text-sm text-center">💰 Pamiętaj: Każda wysłana wiadomość wymaga standardowej opłaty transakcyjnej (gas fee).</p>
            </div>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">🚀 Twoja Działalność Buduje HUB Ecosystem</p>
              <div class="space-y-2 text-sm">
                <p>• <strong>Im więcej tokenów zdobywasz</strong> - tym lepszą pozycję masz</p>
                <p>• <strong>Aktywność w społeczności</strong> - buduje reputację</p>
                <p>• <strong>Każda wiadomość ma znaczenie</strong> dla przyszłych airdropów</p>
              </div>
            </div>

            <p class="text-green-400 font-semibold text-center mt-4">Gotowy by dołączyć? Twoja podróż w <span class="text-purple-400 font-semibold">HUB Ecosystem</span> właśnie się zaczyna!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 5: Start Chatting</p>
            <div class="space-y-3 text-left">
              <p>• <span class="text-cyan-300">Public chat</span> - talk with everyone</p>
              <p>• <span class="text-cyan-300">Online system</span> - see active users</p>
              <p>• <span class="text-cyan-300">Enter</span> - quick sending</p>
            </div>

            <div class="bg-gray-700/50 border border-gray-600/50 rounded-xl p-3 mt-4">
              <p class="text-gray-300 text-sm text-center">💰 Remember: Every sent message requires a standard transaction fee (gas fee).</p>
            </div>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">🚀 Your Activity Builds HUB Ecosystem</p>
              <div class="space-y-2 text-sm">
                <p>• <strong>The more tokens you earn</strong> - the better position you have</p>
                <p>• <strong>Community engagement</strong> - builds reputation</p>
                <p>• <strong>Every message matters</strong> for future airdrops</p>
              </div>
            </div>

            <p class="text-green-400 font-semibold text-center mt-4">Ready to join? Your <span class="text-purple-400 font-semibold">HUB Ecosystem</span> journey starts now!</p>
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
              onClick={currentStep === 5 ? handleClose : nextStep}
              className={`px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-500/50 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 ${
                currentStep === 0 ? 'flex-1' : 'flex-1'
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