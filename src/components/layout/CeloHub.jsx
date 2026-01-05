import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNetwork } from '../../hooks/useNetwork'; // Dodajemy import useNetwork

import HubLogo from "/src/assets/logos/hub.jpg";
import CeloLogo from "/src/assets/logos/celo.jpg";

const translations = {
  en: {
    hub: "HUB Ecosystem",
    hubbyChat: "HUBBY Chat (Telegram)", // Nowy klucz tłumaczenia
    welcomeTitle: "Welcome to our ecosystem!",
    welcomeDescription: "Below you'll find all the main links to our applications and channels.",
    mainLinks: "MAIN LINKS",
    interactCampaigns: "INTRACT CAMPAIGNS",
    website: "Website",
    officialX: "Official X (Twitter) Channel",
    officialZora: "Official Zora Account", 
    officialFarcaster: "Official Farcaster Account",
    officialOpensea: "HUB Ecosystem Genesis NFT",
    discord: "Discord Community",
    openCampaign: "Open Campaign",
    earlyAccessEvent: "Early Access Event — Be the First to Enter HUB Portal Chat",
    joinWeb3Revolution: "JOIN THE WEB3 REVOLUTION"
  }
};

const CeloHub = ({ isMobile = false, showButton = true, isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('hub');
  const [expandedBadge, setExpandedBadge] = useState(null);
  const [language] = useState('en');
  
  // Pobieramy informacje o sieci
  const { isMonad } = useNetwork();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const t = translations[language];

  const iconMap = {
    'hub.logo': HubLogo,
    'celo.logo': CeloLogo,
  };

  const categories = {
    hub: {
      title: t.hub,
      icon: "💫"
    }
  };

  // Bazowe główne linki
  const baseMainLinks = {
    en: [
      {
        name: t.website,
        url: "https://hubecosystem.xyz/",
        icon: "🌐"
      },
      {
        name: t.officialX,
        url: "https://x.com/HUB_Ecosystem",
        icon: "🐦"
      },
      {
        name: t.officialZora,
        url: "https://zora.co/@hubportal",
        icon: "🖼️"
      },
      {
        name: t.officialFarcaster,
        url: "https://warpcast.com/~/channel/hub-ecosystem",
        icon: "🔮"
      },
      {
        name: t.officialOpensea,
        url: "https://opensea.io/collection/hub-ecosystem-genesis-nft",
        icon: "🌊"
      },
      {
        name: t.discord,
        url: "https://discord.gg/ejHSKnmPXK",
        icon: "💬"
      }
    ]
  };

  // Link do Telegrama HUBBY Chat - tylko dla Monad
  const hubbyTelegramLink = {
    en: [
      {
        name: t.hubbyChat,
        url: "https://t.me/+_Q1A-dW002c5MjFk",
        icon: "💬"
      }
    ]
  };

  // Dynamicznie budujemy listę linków w zależności od sieci
  const getMainLinks = () => {
    const links = [...baseMainLinks[language]];
    
    // Dodaj link do Telegrama tylko jeśli jesteśmy na sieci Monad
    if (isMonad) {
      links.push(...hubbyTelegramLink[language]);
    }
    
    return links;
  };

  const interactCampaigns = {
    en: [
      {
        name: t.earlyAccessEvent,
        url: "https://quest.intract.io/quest/69182c7d5ee5c0186137e7a5",
        icon: "🚀",
        status: t.openCampaign
      },
      {
        name: t.joinWeb3Revolution, 
        url: "https://quest.intract.io/quest/690d04b45ee5c0186132330c",
        icon: "💫",
        status: t.openCampaign
      }
    ]
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    setExpandedBadge(null);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setExpandedBadge(null);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const renderIcon = (icon) => {
    if (icon.includes('.logo') && iconMap[icon]) {
      return (
        <div className={`rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 overflow-hidden ${
          isMobile ? 'w-8 h-8' : 'w-10 h-10'
        }`}>
          <img 
            src={iconMap[icon]} 
            alt=""
            className={isMobile ? 'w-6 h-6 object-contain' : 'w-8 h-8 object-contain'}
          />
        </div>
      );
    }
    return (
      <div className={`rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ${
        isMobile ? 'w-8 h-8 text-base' : 'w-10 h-10 text-lg'
      }`}>
        {icon}
      </div>
    );
  };

  const renderCategoryIcon = (icon) => {
    if (icon.includes('.logo') && iconMap[icon]) {
      return (
        <div className={`rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden ${
          isMobile ? 'w-10 h-10' : 'w-12 h-12'
        }`}>
          <img 
            src={iconMap[icon]} 
            alt=""
            className={isMobile ? 'w-8 h-8 object-contain' : 'w-10 h-10 object-contain'}
          />
        </div>
      );
    }
    return (
      <div className={`rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform ${
        isMobile ? 'w-10 h-10 text-base' : 'w-12 h-12 text-xl'
      }`}>
        {icon}
      </div>
    );
  };

  const CeloHubModal = () => {
    if (!isOpen) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className={`relative bg-gray-800 border-2 border-cyan-500/40 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col ${
          isMobile ? 'w-full max-w-sm rounded-2xl max-h-[85vh]' : 'w-full max-w-4xl'
        }`}>
          
          <div className={`bg-gray-800 border-b border-cyan-500/30 rounded-t-3xl flex-shrink-0 ${
            isMobile ? 'p-4' : 'p-6'
          }`}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
              <div>
                <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1 ${
                  isMobile ? 'text-xl' : 'text-3xl'
                }`}>
                  {isMobile ? '💫 HUB Ecosystem' : '💫 HUB Ecosystem'}
                </h2>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : ''}`}>
                  {categories[currentView].title}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClose}
                  className={`text-gray-400 hover:text-white transition-all hover:scale-110 hover:bg-gray-700/50 rounded-xl ${
                    isMobile ? 'text-xl p-1' : 'text-2xl p-2'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            {!expandedBadge && (
              <div className={`flex flex-wrap gap-2 ${isMobile ? 'gap-1' : ''}`}>
                {Object.entries(categories).map(([key, { title, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className={`px-3 py-2 rounded-xl font-semibold transition-all border-2 ${
                      currentView === key
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-700'
                    } ${isMobile ? 'text-xs px-2 py-1 rounded-lg' : 'text-sm'}`}
                  >
                    {icon} {title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
            {currentView === 'hub' && !expandedBadge && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 {t.welcomeTitle}</h3>
                  <p className="text-gray-300">
                    {t.welcomeDescription}
                  </p>
                </div>

                {/* Main Links Section */}
                <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔗</span>
                    <h3 className="text-xl font-bold text-cyan-400">{t.mainLinks}</h3>
                  </div>
                  <div className="space-y-3">
                    {getMainLinks().map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 bg-gray-600/30 rounded-xl hover:bg-gray-600/50 transition-all group ${
                          // Specjalne podświetlenie dla linku Telegrama na Monad
                          isMonad && link.name === t.hubbyChat ? 'border border-[#836EF9]/30' : ''
                        }`}
                      >
                        <span className={`text-lg ${
                          // Specjalny kolor ikony dla Telegrama na Monad
                          isMonad && link.name === t.hubbyChat ? 'text-[#836EF9]' : ''
                        }`}>
                          {link.icon}
                        </span>
                        <div className="flex-1">
                          <p className={`text-gray-300 font-medium group-hover:text-cyan-300 transition-colors ${
                            // Specjalny kolor tekstu dla Telegrama na Monad
                            isMonad && link.name === t.hubbyChat ? 'group-hover:text-[#836EF9]' : ''
                          }`}>
                            {link.name}
                          </p>
                        </div>
                        <span className={`text-gray-400 group-hover:text-cyan-400 transition-colors ${
                          // Specjalny kolor strzałki dla Telegrama na Monad
                          isMonad && link.name === t.hubbyChat ? 'group-hover:text-[#836EF9]' : ''
                        }`}>
                          →
                        </span>
                      </a>
                    ))}
                  </div>
                  
                  {/* Informacja o Telegramie dla Monad */}
                  {isMonad && (
                    <div className="mt-4 p-3 bg-[#836EF9]/10 border border-[#836EF9]/30 rounded-lg">
                      <p className="text-[#836EF9] text-sm font-semibold text-center">
                        💬 Join HUBBY Chat on Telegram for Monad network discussions!
                      </p>
                    </div>
                  )}
                </div>

                {/* Intract Campaigns Section */}
                <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-xl font-bold text-purple-400">{t.interactCampaigns}</h3>
                  </div>
                  <div className="space-y-4">
                    {interactCampaigns[language].map((campaign, index) => (
                      <div key={index} className="bg-gray-600/30 rounded-xl p-4 border border-gray-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{campaign.icon}</span>
                            <h4 className="text-gray-300 font-semibold">{campaign.name}</h4>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium">
                            {campaign.status}
                          </span>
                        </div>
                        <a
                          href={campaign.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
                        >
                          <span>🚀</span>
                          <span>Join Campaign</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Removed: Our Applications Section */}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  return (
    <>
      {showButton && !isOpen && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg ${
            isMobile ? 'px-3 py-1.5 text-xs gap-1' : 'px-4 py-2 text-sm'
          }`}
        >
          <img 
            src={CeloLogo} 
            alt="HUB Ecosystem" 
            className={isMobile ? 'w-4 h-4 object-contain' : 'w-5 h-5 object-contain'}
          />
          <span>{isMobile ? 'HUB Ecosystem' : 'HUB Ecosystem'}</span>
        </button>
      )}

      <CeloHubModal />
    </>
  );
};

export default CeloHub;