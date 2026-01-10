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
            <p><span class="text-cyan-300 font-semibold">HUB Portal</span> to pierwsza na świecie społeczność Web3, która łączy realne zarobki z komunikacją w czasie rzeczywistym na <span class="text-yellow-300 font-semibold">sześciu sieciach blockchain</span>!</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base + Linea + Polygon + Soneium + Arbitrum</p>
            <p>Działamy na sześciu sieciach blockchain! Zarabiaj tokeny na każdej z nich i buduj swoją pozycję w ekosystemie Web3.</p>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">💎 Co nas wyróżnia?</p>
              <div class="space-y-2">
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Szybkie nagrody</span> - tokeny trafiają bezpośrednio do portfela</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Sześć ekosystemów</span> - zarabiaj na wielu sieciach jednocześnie</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Prawdziwa własność</span> - Twoje tokeny, Twoja kontrola</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Bezpieczeństwo</span> - audytowane smart kontrakty</p>
              </div>
            </div>

            <p class="text-center text-white italic border-t border-gray-600/30 pt-4 mt-4">Dołącz do społeczności, która nie tylko obserwuje rewolucję Web3 - ale aktywnie ją tworzy.</p>
          </div>`
        : `<div class="space-y-4 text-white">
            <p><span class="text-cyan-300 font-semibold">HUB Portal</span> is the world's first Web3 community combining real earnings with real-time communication on <span class="text-yellow-300 font-semibold">six blockchain networks</span>!</p>

            <p class="text-cyan-300 font-semibold">🎯 Multi-Chain Rewards: Celo + Base + Linea + Polygon + Soneium + Arbitrum</p>
            <p>We operate on six blockchain networks! Earn tokens on each of them and build your position in the Web3 ecosystem.</p>

            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mt-4">
              <p class="text-purple-300 font-semibold text-center mb-2">💎 What Makes Us Unique?</p>
              <div class="space-y-2">
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Fast Rewards</span> - tokens go directly to your wallet</p>
                <p class="flex items-center gap-2"><span class="text-green-400">✓</span> <span class="font-semibold">Six Ecosystems</span> - earn on multiple networks simultaneously</p>
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
              <p class="flex items-center gap-2"><span class="text-green-400">4.</span> <span class="text-green-400">Wspierane sieci:</span> Celo, Base, Linea, Polygon, Soneium i Arbitrum</p>
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
              <p class="flex items-center gap-2"><span class="text-green-400">4.</span> <span class="text-green-400">Supported networks:</span> Celo, Base, Linea, Polygon, Soneium and Arbitrum</p>
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
              <p class="flex items-center gap-2"><span class="text-green-400">6.</span> Jeden profil działa na wszystkich sześciu sieciach!</p>
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
              <p class="flex items-center gap-2"><span class="text-green-400">6.</span> One profile works on all six networks!</p>
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
            <p class="text-cyan-300 font-semibold text-center">Systemy Nagród na Wszystkich Sieciach</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK (Klasyczny)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-cyan-300">10 HC dziennie</span></p>
                <p>• Natychmiastowe dostarczanie tokenów</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK (Zaawansowany)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> za każdą wiadomość</p>
                <p>• <strong class="text-cyan-300">System subskrypcji:</strong></p>
                <p class="ml-4">🎯 <span class="text-green-400">FREE</span>: 10 wiadomości/dzień</p>
                <p class="ml-4">🚀 <span class="text-blue-400">BASIC</span>: 50 wiadomości/dzień (10 USDC/miesiąc)</p>
                <p class="ml-4">👑 <span class="text-purple-400">PREMIUM</span>: Nielimitowane (50 USDC/miesiąc)</p>
              </div>
            </div>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🔷 LINEA NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 LPX token</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-cyan-300">100 LPX dziennie</span></p>
                <p>• Token <span class="text-cyan-300 font-semibold">Linea Prime (LPX)</span></p>
                <p>• Maksymalna podaż: 1,000,000,000 LPX</p>
              </div>
            </div>

            <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
              <p class="text-purple-300 font-semibold text-center mb-2">🔶 POLYGON NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">Mining tokena MSG</span> za aktywność</p>
                <p>• Limit: <span class="text-purple-300">100 MSG dziennie</span></p>
                <p>• Natychmiastowe dostarczanie tokenów</p>
                <p>• Niska opłata gas</p>
              </div>
            </div>

            <div class="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mb-3">
              <p class="text-pink-300 font-semibold text-center mb-2">✨ SONEIUM NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-pink-300">Mining tokena LUM</span> za aktywność</p>
                <p>• Limit: <span class="text-pink-300">100 LUM dziennie</span></p>
                <p>• Ekskluzywne środowisko blockchain</p>
                <p>• Unikalne możliwości sieci Soneium</p>
              </div>
            </div>

            <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-3">
              <p class="text-emerald-300 font-semibold text-center mb-2">🔵 ARBITRUM NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-emerald-300">1 Portal Token (ARBX)</span> za każdą wiadomość</p>
                <p>• Limit: <span class="text-emerald-300">100 ARBX dziennie</span></p>
                <p>• Niskie opłaty transakcyjne</p>
                <p>• Dostęp do ekosystemu Layer 2</p>
              </div>
            </div>

            <p class="text-yellow-300 text-sm text-center mt-4">💡 Wybierz sieć w aplikacji by przełączać między systemami!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Rewards Systems on All Networks</p>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">📱 CELO NETWORK (Classic)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 HC token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">10 HC daily</span></p>
                <p>• Instant token delivery</p>
              </div>
            </div>

            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
              <p class="text-blue-300 font-semibold text-center mb-2">🌉 BASE NETWORK (Advanced)</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">1 HUB token</span> per message</p>
                <p>• <strong class="text-cyan-300">Subscription System:</strong></p>
                <p class="ml-4">🎯 <span class="text-green-400">FREE</span>: 10 messages/day</p>
                <p class="ml-4">🚀 <span class="text-blue-400">BASIC</span>: 50 messages/day (10 USDC/month)</p>
                <p class="ml-4">👑 <span class="text-purple-400">PREMIUM</span>: Unlimited (50 USDC/month)</p>
              </div>
            </div>

            <div class="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🔷 LINEA NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-cyan-300">1 LPX token</span> per message</p>
                <p>• Limit: <span class="text-cyan-300">100 LPX daily</span></p>
                <p>• <span class="text-cyan-300 font-semibold">Linea Prime (LPX)</span> token</p>
                <p>• Max supply: 1,000,000,000 LPX</p>
              </div>
            </div>

            <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
              <p class="text-purple-300 font-semibold text-center mb-2">🔶 POLYGON NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-purple-300">MSG token mining</span> for activity</p>
                <p>• Limit: <span class="text-purple-300">100 MSG daily</span></p>
                <p>• Instant token delivery</p>
                <p>• Low gas fees</p>
              </div>
            </div>

            <div class="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 mb-3">
              <p class="text-pink-300 font-semibold text-center mb-2">✨ SONEIUM NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-pink-300">LUM token mining</span> for activity</p>
                <p>• Limit: <span class="text-pink-300">100 LUM daily</span></p>
                <p>• Exclusive blockchain environment</p>
                <p>• Unique Soneium network opportunities</p>
              </div>
            </div>

            <div class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-3">
              <p class="text-emerald-300 font-semibold text-center mb-2">🔵 ARBITRUM NETWORK</p>
              <div class="space-y-1 text-sm">
                <p>• <span class="text-emerald-300">1 Portal Token (ARBX)</span> per message</p>
                <p>• Limit: <span class="text-emerald-300">100 ARBX daily</span></p>
                <p>• Low transaction fees</p>
                <p>• Access to Layer 2 ecosystem</p>
              </div>
            </div>

            <p class="text-yellow-300 text-sm text-center mt-4">💡 Choose network in app to switch between systems!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Dalej →' : 'Next →'
    },
    {
      id: 4,
      title: language === 'pl' ? "🔮 Sekrety Pozycjonowania" : "🔮 Positioning Secrets",
      icon: "🔮",
      type: 'mystery',
      content: language === 'pl'
        ? `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Ukryte Mechanizmy i Pozycjonowanie</p>
            
            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
              <p class="text-purple-300 font-semibold text-center mb-2">🗝️ Tajemnica Aktywności</p>
              <div class="space-y-2">
                <p class="text-gray-300 text-sm">Każda Twoja wiadomość to nie tylko token - to także <span class="text-cyan-300 font-semibold">cyfrowy odcisk</span> w społeczności.</p>
                <p class="text-gray-300 text-sm">Im więcej angażujesz się w rozmowy, tym bardziej Twoja obecność <span class="text-green-400 font-semibold">rezonuje</span> w ekosystemie.</p>
                <p class="text-gray-300 text-sm">Pozycjonuj się nie poprzez hałas, ale przez <span class="text-yellow-300 font-semibold">wartościową komunikację</span>.</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🎭 Nieoczywiste Wskazówki</p>
              <div class="space-y-2">
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Liczby mają znaczenie</span>, ale nie te, o których myślisz</p>
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Jakość > Ilość</span> - choć obie są śledzone</p>
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Cierpliwość</span> jest kluczową cnotą w Web3</p>
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Wielosieciowość</span> otwiera więcej drzwi niż Ci się wydaje</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">🌠 Co Oczekuje Aktywnych?</p>
              <div class="space-y-2">
                <p class="text-gray-300 text-sm">Ci, którzy traktują tę społeczność jako swój <span class="text-yellow-300">cyfrowy dom</span>, a nie tylko źródło tokenów...</p>
                <p class="text-gray-300 text-sm">Ci, którzy budują <span class="text-green-400">autentyczne relacje</span> i dzielą się wiedzą...</p>
                <p class="text-gray-300 text-sm">Ci, którzy rozumieją, że <span class="text-purple-300">Web3 to maraton, nie sprint</span>...</p>
                <p class="text-gray-300 text-sm font-semibold italic text-center pt-2">...odkrywają, że czas spędzony tutaj zawsze zwraca się w nieoczekiwany sposób.</p>
              </div>
            </div>

            <p class="text-center text-sm text-gray-400 italic mt-4">"Nie pytaj co ekosystem może zrobić dla Ciebie, ale co Ty możesz zbudować w ekosystemie"</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Hidden Mechanisms & Positioning</p>
            
            <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
              <p class="text-purple-300 font-semibold text-center mb-2">🗝️ The Activity Secret</p>
              <div class="space-y-2">
                <p class="text-gray-300 text-sm">Every message you send is not just a token - it's a <span class="text-cyan-300 font-semibold">digital fingerprint</span> in the community.</p>
                <p class="text-gray-300 text-sm">The more you engage in conversations, the more your presence <span class="text-green-400 font-semibold">resonates</span> throughout the ecosystem.</p>
                <p class="text-gray-300 text-sm">Position yourself not through noise, but through <span class="text-yellow-300 font-semibold">valuable communication</span>.</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 mb-3">
              <p class="text-cyan-300 font-semibold text-center mb-2">🎭 Unobvious Clues</p>
              <div class="space-y-2">
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Numbers matter</span>, but not the ones you're thinking of</p>
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Quality > Quantity</span> - though both are tracked</p>
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Patience</span> is a key virtue in Web3</p>
                <p class="text-gray-300 text-sm">• <span class="text-cyan-300">Multi-chain engagement</span> opens more doors than you realize</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
              <p class="text-yellow-300 font-semibold text-center mb-2">🌠 What Awaits the Active?</p>
              <div class="space-y-2">
                <p class="text-gray-300 text-sm">Those who treat this community as their <span class="text-yellow-300">digital home</span>, not just a token source...</p>
                <p class="text-gray-300 text-sm">Those who build <span class="text-green-400">authentic relationships</span> and share knowledge...</p>
                <p class="text-gray-300 text-sm">Those who understand that <span class="text-purple-300">Web3 is a marathon, not a sprint</span>...</p>
                <p class="text-gray-300 text-sm font-semibold italic text-center pt-2">...discover that time spent here always returns in unexpected ways.</p>
              </div>
            </div>

            <p class="text-center text-sm text-gray-400 italic mt-4">"Ask not what the ecosystem can do for you, but what you can build within the ecosystem"</p>
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
            <p class="text-cyan-300 font-semibold text-center">Krok 5: Funkcje Czatu</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-cyan-300">💬</span> <span class="font-semibold">Jedyny kanał publiczny</span> - rozmawiaj z całą społecznością</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">⚡</span> <span class="font-semibold">Real-time sync</span> - wiadomości na wszystkich urządzeniach</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🌐</span> <span class="font-semibold">Przełączanie sieci</span> - zarabiaj na 6 sieciach jednocześnie</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">👥</span> <span class="font-semibold">Lista użytkowników</span> - zobacz kto jest online</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🎯</span> <span class="font-semibold">Limity dzienne</span> - śledź swoje postępy na każdej sieci</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">📊</span> <span class="font-semibold">Leaderboardy</span> - sprawdź ranking aktywnych użytkowników</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🔥</span> <span class="font-semibold">Daily Streak</span> - śledź swoją codzienną aktywność</p>
            </div>

            <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
              <p class="text-green-300 font-semibold text-center mb-2">🚀 Ostatnia Wskazówka</p>
              <p class="text-gray-300 text-sm text-center">Rozpocznij od małych kroków. Znajdź swoją przestrzeń. Bądź autentyczny. Reszta przyjdzie naturalnie.</p>
              <p class="text-cyan-400 text-xs text-center mt-2 italic">Pamiętaj: najwięksi w Web3 nie są tam, gdzie byli wczoraj, ale tam, gdzie będą jutro.</p>
            </div>

            <p class="text-green-400 font-semibold text-center mt-4">Gotowy by dołączyć? Twoja podróż w <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> właśnie się zaczyna!</p>
          </div>`
        : `<div class="space-y-4 text-white mx-auto max-w-md">
            <p class="text-cyan-300 font-semibold text-center">Step 5: Chat Features</p>
            <div class="space-y-3 text-left bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
              <p class="flex items-center gap-2"><span class="text-cyan-300">💬</span> <span class="font-semibold">Single public channel</span> - talk with entire community</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">⚡</span> <span class="font-semibold">Real-time sync</span> - messages on all devices</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🌐</span> <span class="font-semibold">Network switching</span> - earn on 6 networks simultaneously</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">👥</span> <span class="font-semibold">User list</span> - see who's online</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🎯</span> <span class="font-semibold">Daily limits</span> - track your progress on each network</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">📊</span> <span class="font-semibold">Leaderboards</span> - check ranking of active users</p>
              <p class="flex items-center gap-2"><span class="text-cyan-300">🔥</span> <span class="font-semibold">Daily Streak</span> - track your daily activity</p>
            </div>

            <div class="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 mt-4">
              <p class="text-green-300 font-semibold text-center mb-2">🚀 Final Tip</p>
              <p class="text-gray-300 text-sm text-center">Start with small steps. Find your space. Be authentic. The rest will come naturally.</p>
              <p class="text-cyan-400 text-xs text-center mt-2 italic">Remember: the biggest in Web3 aren't where they were yesterday, but where they'll be tomorrow.</p>
            </div>

            <p class="text-green-400 font-semibold text-center mt-4">Ready to join? Your <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">HUB Ecosystem</span> journey starts now!</p>
          </div>`,
      buttonText: language === 'pl' ? 'Rozpocznij Czatowanie!' : 'Start Chatting!'
    }
  ];

  // Dodajemy sekcję admina tylko dla adminów na koniec
  const adminStep = {
    id: 6,
    title: language === 'pl' ? "👑 Funkcje Admina" : "👑 Admin Features",
    icon: "👑",
    type: 'admin',
    content: language === 'pl'
      ? `<div class="space-y-4 text-white mx-auto max-w-md">
          <p class="text-purple-300 font-semibold text-center">Wyłączne Funkcje Administracyjne</p>
          
          <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
            <p class="text-purple-300 font-semibold text-center mb-2">🔗 Formatowanie Linków</p>
            <div class="space-y-2 text-sm">
              <p class="text-gray-300">Jako admin możesz używać specjalnego formatowania:</p>
              <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <p class="text-cyan-300">[tweet|Twój tekst|https://x.com] → <span class="text-green-400">📢 Twój tekst</span></p>
                <p class="text-gray-400 text-xs mt-1">Tworzy link z ikoną tweet i podanym tekstem</p>
              </div>
              <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-2">
                <p class="text-cyan-300">[video|Tytuł wideo|https://youtube.com] → <span class="text-green-400">🎥 Tytuł wideo</span></p>
                <p class="text-gray-400 text-xs mt-1">Tworzy link z ikoną wideo</p>
              </div>
              <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-2">
                <p class="text-cyan-300">[doc|Nazwa dokumentu|https://docs.com] → <span class="text-green-400">📄 Nazwa dokumentu</span></p>
                <p class="text-gray-400 text-xs mt-1">Tworzy link z ikoną dokumentu</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
            <p class="text-yellow-300 font-semibold text-center mb-2">🛡️ Odpowiedzialność Admina</p>
            <div class="space-y-2 text-sm">
              <p class="text-gray-300">Twoje uprawnienia przynoszą odpowiedzialność:</p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Wspieraj nowych użytkowników</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Utrzymuj pozytywną atmosferę</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Dziel się wiedzą o Web3</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Promuj wartościowe treści</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Pomagaj w rozwiązywaniu problemów</span></p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
            <p class="text-blue-300 font-semibold text-center mb-2">🎯 Wskazówki Dla Admina</p>
            <div class="space-y-2 text-sm">
              <p class="text-gray-300">Używaj swoich uprawnień mądrze:</p>
              <p class="text-gray-300 italic text-center">"Najlepsi liderzy nie pokazują swojej mocy, ale inspirują innych do odkrycia ich własnej siły."</p>
            </div>
          </div>

          <p class="text-center text-sm text-gray-400 mt-4">Dziękujemy za byście częścią zespołu który buduje przyszłość HUB Ecosystem! 🚀</p>
        </div>`
      : `<div class="space-y-4 text-white mx-auto max-w-md">
          <p class="text-purple-300 font-semibold text-center">Exclusive Administrative Features</p>
          
          <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 mb-3">
            <p class="text-purple-300 font-semibold text-center mb-2">🔗 Link Formatting</p>
            <div class="space-y-2 text-sm">
              <p class="text-gray-300">As admin you can use special formatting:</p>
              <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <p class="text-cyan-300">[tweet|Your text|https://x.com] → <span class="text-green-400">📢 Your text</span></p>
                <p class="text-gray-400 text-xs mt-1">Creates link with tweet icon and custom text</p>
              </div>
              <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-2">
                <p class="text-cyan-300">[video|Video title|https://youtube.com] → <span class="text-green-400">🎥 Video title</span></p>
                <p class="text-gray-400 text-xs mt-1">Creates link with video icon</p>
              </div>
              <div class="bg-gray-800/50 p-3 rounded-lg border border-gray-700 mt-2">
                <p class="text-cyan-300">[doc|Document name|https://docs.com] → <span class="text-green-400">📄 Document name</span></p>
                <p class="text-gray-400 text-xs mt-1">Creates link with document icon</p>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-xl p-4 mb-3">
            <p class="text-yellow-300 font-semibold text-center mb-2">🛡️ Admin Responsibility</p>
            <div class="space-y-2 text-sm">
              <p class="text-gray-300">Your privileges come with responsibility:</p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Support new users</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Maintain positive atmosphere</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Share Web3 knowledge</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Promote valuable content</span></p>
              <p class="flex items-start gap-2"><span class="text-green-400 mt-1">✓</span> <span>Help solve problems</span></p>
            </div>
          </div>

          <div class="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4 mb-3">
            <p class="text-blue-300 font-semibold text-center mb-2">🎯 Admin Tips</p>
            <div class="space-y-2 text-sm">
              <p class="text-gray-300">Use your powers wisely:</p>
              <p class="text-gray-300 italic text-center">"The best leaders don't show their power, but inspire others to discover their own strength."</p>
            </div>
          </div>

          <p class="text-center text-sm text-gray-400 mt-4">Thank you for being part of the team building the future of HUB Ecosystem! 🚀</p>
        </div>`,
    buttonText: language === 'pl' ? 'Zakończ Przewodnik' : 'Finish Guide'
  };

  // Jeśli użytkownik jest adminem, dodajemy krok admina
  const allSteps = isAdmin ? [...steps, adminStep] : steps;

  const currentStepData = allSteps[currentStep];

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, allSteps.length - 1));
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
              {allSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    index === currentStep 
                      ? step.type === 'admin' ? 'bg-purple-500' : step.type === 'mystery' ? 'bg-purple-500' : 'bg-cyan-500'
                      : index < currentStep 
                        ? step.type === 'admin' ? 'bg-purple-500/50' : step.type === 'mystery' ? 'bg-purple-500/50' : 'bg-cyan-500/50'
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
                  : currentStepData.type === 'mystery'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                  : currentStepData.type === 'admin'
                  ? 'bg-gradient-to-r from-purple-500/20 to-yellow-500/20'
                  : 'bg-cyan-500/20'
              } flex items-center justify-center mx-auto ${isMobile ? 'mb-3' : 'mb-4'}`}>
                {currentStepData.icon}
              </div>
              <h2 className={`font-bold ${
                currentStepData.type === 'mystery' ? 'text-purple-300' : 
                currentStepData.type === 'admin' ? 'text-yellow-300' : 'text-cyan-300'
              } ${
                isMobile ? 'text-lg mb-1' : 'text-2xl mb-2'
              }`}>
                {currentStepData.title}
              </h2>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {language === 'pl' ? `Krok ${currentStep + 1} z ${allSteps.length}` : `Step ${currentStep + 1} of ${allSteps.length}`}
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
              onClick={currentStep === allSteps.length - 1 ? handleClose : nextStep}
              className={`${
                isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'
              } ${
                currentStep === 0 ? 'flex-1' : 'flex-1'
              } ${
                currentStepData.type === 'mystery'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-500/50 hover:from-purple-600 hover:to-pink-600'
                  : currentStepData.type === 'admin'
                  ? 'bg-gradient-to-r from-purple-500 to-yellow-500 border border-purple-500/50 hover:from-purple-600 hover:to-yellow-600'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-500/50 hover:from-cyan-600 hover:to-blue-600'
              } rounded-xl text-white font-semibold transition-all transform hover:scale-105`}
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