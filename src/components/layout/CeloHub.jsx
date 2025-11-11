import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// PEŁNE ŚCIEŻKI DO LOGO
import TalentLogo from "/src/assets/logos/talent.jpg";
import KarmaLogo from "/src/assets/logos/karmaGap.jpg";
import ProsperityLogo from "/src/assets/logos/prosperity.png";
import CeloPGLogo from "/src/assets/logos/celopublic.png";
import HubLogo from "/src/assets/logos/hub.jpg";
import CeloLogo from "/src/assets/logos/celo.jpg"; // DODANE LOGO CELO

// COMPLETE TRANSLATION SYSTEM
const translations = {
  en: {
    // Categories
    dashboard: "Ecosystem Dashboard",
    badges: "Builders Program",
    defi: "DeFi",
    exchange: "Exchange",
    nfts: "NFT Platofrms",
    tools: "Developer Tools",
    wallets: "Wallets",
    impact: "Social Impact",
    community: "Community & Social",
    hub: "HUB Ecosystem",
    
    // Common UI Text
    backToBadges: "Back to Programs",
    visit: "Visit",
    explore: "Explore",
    getStarted: "Get Started",
    download: "Download",
    apply: "Apply",
    learnMore: "Learn More",
    whyItMatters: "Why It Matters",
    howToProgress: "How to Progress",
    tiers: "Tiers",
    links: "Links",
    officialWebsite: "Official Website",
    documentation: "Documentation",
    programsOverview: "Programs Overview",
    
    // Badge Descriptions
    karmaGapDesc: "Decentralized identity and reputation protocol building on Celo",
    talentProtocolDesc: "Web3 professional network and talent discovery platform", 
    celoProgramsDesc: "Official Celo ecosystem programs and initiatives",
    
    // Section Headers
    celoProgramsHeader: "Builders Programs",
    celoProgramsText: "Discover programs and identity solutions that help you build reputation and earn rewards across the Celo ecosystem through verified contributions and participation.",
    hubEcosystemHeader: "HUB Ecosystem",
    hubEcosystemText: "A growing collection of open-source projects developed by the HUB community, focused on building tools and infrastructure for the Celo ecosystem.",
    
    // Token Label
    tokenAddress: "Token Address",
    
    // Dashboard Descriptions
    badgesDesc: "Talent Protocol, Karma Gap, Prosperity Pass",
    defiDesc: "Aave, Uniswap, Mento, Ubeswap",
    exchangeDesc: "Coming soon...",
    nftsDesc: "Celosphere and other NFT platforms",
    toolsDesc: "Alchemy, Infura, QuickNode, thirdweb",
    walletsDesc: "MetaMask, Valora, Celo Terminal", 
    impactDesc: "Mercy Corps, Grameen, GoodDollar",
    communityDesc: "Forum, Twitter, GitHub, Blog",
    hubDesc: "HUB Chat, HUB Vote, GM Hub"
  }
};

const CeloHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [expandedBadge, setExpandedBadge] = useState(null);
  const [language] = useState('en');

  const t = translations[language];

  // MAPPING IKON DO IMPORTÓW
  const iconMap = {
    'talent.logo': TalentLogo,
    'karma.logo': KarmaLogo,
    'prosperity.logo': ProsperityLogo,
    'celopg.logo': CeloPGLogo,
    'hub.logo': HubLogo,
    'celo.logo': CeloLogo, // DODANE LOGO CELO
  };

  // MAIN CATEGORIES
  const categories = {
    dashboard: {
      title: t.dashboard,
      icon: "🏠"
    },
    badges: {
      title: t.badges,
      icon: "🎖️"
    },
    defi: {
      title: t.defi,
      icon: "💹"
    },
    exchange: {
      title: t.exchange,
      icon: "🔄"
    },
    nfts: {
      title: t.nfts,
      icon: "🖼️"
    },
    tools: {
      title: t.tools,
      icon: "🛠️"
    },
    wallets: {
      title: t.wallets,
      icon: "👛"
    },
    impact: {
      title: t.impact,
      icon: "🌍"
    },
    community: {
      title: t.community,
      icon: "👥"
    },
    hub: {
      title: t.hub,
      icon: "💫"
    }
  };

  // BUILDERS PROGRAM DATA
  const buildersPrograms = {
    en: [
      {
        id: 'talent-protocol',
        name: "Talent Protocol", 
        category: "Professional Network",
        icon: "talent.logo",
        description: "Web3 professional network and talent discovery platform",
        whyItMatters: "Talent Protocol enables builders and creators to showcase their skills, build professional reputation, and connect with opportunities in the Celo ecosystem through verifiable on-chain credentials.",
        howToProgress: [
          "Create your Talent Protocol profile",
          "Connect your GitHub and other professional accounts",
          "Earn skills badges through contributions",
          "Build your Builder Score reputation"
        ],
        tiers: [
          "Builder Score 100+",
          "Builder Score 500+",
          "Builder Score 1000+",
          "Top Talent Tier"
        ],
        links: [
          { name: "Official Website", url: "https://talentprotocol.com/" },
          { name: "Celo Integration", url: "https://talentprotocol.com/celo" }
        ]
      },
      {
        id: 'karma-gap',
        name: "Karma Gap",
        category: "Identity & Reputation",
        icon: "karma.logo",
        description: "Decentralized identity and reputation protocol building on Celo",
        whyItMatters: "Karma Gap provides decentralized identity solutions that help users build verifiable reputation across the Celo ecosystem, enabling trustless interactions and personalized experiences.",
        howToProgress: [
          "Connect your wallet to Karma Gap platform",
          "Complete identity verification steps",
          "Build your reputation through ecosystem participation",
          "Use your Karma identity across supported dApps"
        ],
        tiers: [
          "Basic Identity Verification",
          "Reputation Level 1",
          "Reputation Level 2", 
          "Advanced Reputation Tier"
        ],
        links: [
          { name: "Official Website", url: "https://www.karmahq.xyz/" },
          { name: "Documentation", url: "https://docs.karmahq.xyz/" }
        ]
      },
      {
        id: 'prosperity-pass',
        name: "Prosperity Pass",
        category: "Ecosystem Access",
        icon: "prosperity.logo",
        description: "Access pass for Celo ecosystem benefits and rewards",
        whyItMatters: "Prosperity Pass provides exclusive access to ecosystem benefits, rewards, and opportunities within the Celo network, helping builders and users maximize their participation.",
        howToProgress: [
          "Visit the Prosperity Pass website",
          "Connect your wallet and verify eligibility",
          "Claim your pass and start earning rewards",
          "Participate in exclusive ecosystem activities"
        ],
        tiers: [
          "Basic Pass Holder",
          "Active Participant",
          "Ecosystem Contributor",
          "Premium Member"
        ],
        links: [
          { name: "Official Website", url: "https://pass.celopg.eco/welcome" },
          { name: "Get Started", url: "https://pass.celopg.eco/welcome" }
        ]
      }
    ]
  };

  // DeFi DATA
  const defiProjects = [
    {
      name: "Aave",
      description: "Leading decentralized lending protocol on Celo",
      url: "https://app.aave.com/",
      icon: "🏦"
    },
    {
      name: "Uniswap",
      description: "Leading decentralized exchange protocol",
      url: "https://uniswap.org/",
      icon: "🦄"
    },
    {
      name: "Mento",
      description: "Celo's native stablecoin protocol", 
      url: "https://www.mento.org/",
      icon: "🌊"
    },
    {
      name: "Ubeswap",
      description: "DeFi platform on Celo with yield farming",
      url: "https://ubeswap.org/",
      icon: "🍀"
    },
    {
      name: "Curve",
      description: "Low-slippage stablecoin trading",
      url: "https://curve.fi/",
      icon: "📈"
    }
  ];

  // EXCHANGE DATA (currently empty)
  const exchangePlatforms = [
    {
      name: "More exchanges coming soon",
      description: "We're working on adding major exchanges to the Celo ecosystem",
      url: "#",
      icon: "🚧"
    }
  ];

  // NFT PROJECTS DATA
  const nftPlatforms = [
    {
      name: "Celosphere",
      description: "Premier NFT marketplace and community on Celo",
      url: "https://celosphere.xyz/",
      icon: "🌐"
    },
    {
      name: "OpenSea",
      description: "Largest NFT marketplace with Celo support",
      url: "https://opensea.io/",
      icon: "🌊"
    },
    {
      name: "Rarible",
      description: "Multi-chain NFT marketplace",
      url: "https://rarible.com/",
      icon: "🎨"
    }
  ];

  // DEVELOPER TOOLS
  const developerTools = [
    {
      name: "Alchemy",
      description: "Celo chain API and development platform",
      url: "https://docs.alchemy.com/reference/celo-chain-api-quickstart",
      icon: "⚗️"
    },
    {
      name: "Ankr",
      description: "RPC provider for Celo network",
      url: "https://www.ankr.com/rpc/celo/",
      icon: "🔮"
    },
    {
      name: "Infura",
      description: "Blockchain infrastructure for Celo",
      url: "https://www.infura.io/networks/celo",
      icon: "🏗️"
    },
    {
      name: "QuickNode",
      description: "Celo node infrastructure",
      url: "https://www.quicknode.com/docs/celo",
      icon: "⚡"
    },
    {
      name: "dRPC",
      description: "Decentralized RPC network",
      url: "https://drpc.org/",
      icon: "🌐"
    },
    {
      name: "thirdweb",
      description: "Web3 development framework for Celo",
      url: "https://thirdweb.com/celo",
      icon: "🛠️"
    }
  ];

  // WALLETS
  const wallets = [
    {
      name: "MetaMask",
      description: "Browser and mobile wallet with Celo support",
      url: "https://docs.celo.org/wallet/metamask/use",
      icon: "🦊"
    },
    {
      name: "Valora",
      description: "Mobile-first wallet for Celo ecosystem",
      url: "https://support.valoraapp.com/hc/articles/360061350071",
      icon: "📱"
    },
    {
      name: "Celo Terminal",
      description: "Desktop wallet for Celo",
      url: "https://celoterminal.com/",
      icon: "💻"
    }
  ];

  // SOCIAL IMPACT
  const socialImpact = [
    {
      name: "Mercy Corps",
      description: "Humanitarian aid and financial inclusion",
      url: "https://www.mercycorps.org/",
      icon: "🤝"
    },
    {
      name: "Grameen Foundation",
      description: "Poverty alleviation through microfinance",
      url: "https://grameenfoundation.org/",
      icon: "🏦"
    },
    {
      name: "GoodDollar",
      description: "Universal basic income protocol",
      url: "https://www.gooddollar.org/",
      icon: "💝"
    }
  ];

  // COMMUNITY & SOCIAL
  const communityResources = [
    {
      name: "Celo Website",
      description: "Official Celo website",
      url: "https://celo.org/",
      icon: "🌐"
    },
    {
      name: "Governance Forum",
      description: "Celo governance discussions and proposals",
      url: "https://forum.celo.org/c/governance/12",
      icon: "🗳️"
    },
    {
      name: "Twitter",
      description: "Official Celo Twitter account",
      url: "https://twitter.com/CeloOrg",
      icon: "🐦"
    },
    {
      name: "Medium",
      description: "Celo blog and announcements",
      url: "https://blog.celo.org/",
      icon: "📝"
    },
    {
      name: "GitHub",
      description: "Celo open source repositories",
      url: "https://github.com/celo-org",
      icon: "💻"
    },
    {
      name: "Add Your Project",
      description: "Submit your project to Celo ecosystem",
      url: "https://forms.gle/USBx68Ydw4336RM86",
      icon: "🚀"
    }
  ];

  // ACTIVE CELO PROGRAMS DATA
  const activeCeloPrograms = {
    en: [
      {
        id: 'celo-programs',
        name: "Celo Public Goods",
        category: "Ecosystem Funding",
        icon: "celopg.logo",
        description: "Celo Public Goods (CeloPG) was created to streamline the Celo Community Governance and Treasury coordination and, through builder programs, help accelerate and strengthen the Celo ecosystem.",
        whyItMatters: "Celo Public Goods provides funding and support for public goods that benefit the entire Celo ecosystem, helping to accelerate development and strengthen the network through community-driven initiatives.",
        howToProgress: [
          "Visit the Celo Public Goods website",
          "Explore available funding programs",
          "Submit your project proposal",
          "Participate in community governance"
        ],
        tiers: [
          "Project Applicant",
          "Approved Project", 
          "Funded Initiative",
          "Ecosystem Partner"
        ],
        links: [
          { name: "Official Website", url: "https://www.celopg.eco/" },
          { name: "Programs Overview", url: "https://www.celopg.eco/programs" },
          { name: "Apply Now", url: "https://www.celopg.eco/apply" }
        ]
      }
    ]
  };

  // HUB ECOSYSTEM PROJECTS
  const hubProjects = {
    en: [
      {
        name: "HUB Ecosystem Portal",
        description: "Main website and ecosystem hub for all HUB projects and community initiatives",
        status: "🟢 Live",
        links: {
          website: "https://hubecosystem.xyz/",
          github: "https://github.com/Hub-Ecosystem-Portal/HubEcosystem",
          twitter: "https://x.com/HUB_Ecosystem",
          discord: "https://discord.gg/eVC4C5tdZq"
        },
        token: "0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E (Base)",
        tech: ["React", "Web3", "Community"],
        icon: "hub.logo"
      },
      {
        name: "HUB Chat",
        description: "Decentralized social chat application on Celo with real-time messaging",
        status: "🟢 Live",
        links: {
          live: "https://hub-portal-chat.vercel.app/",
          github: "https://github.com/Hub-Ecosystem-Portal/Hub-Chat"
        },
        tech: ["React", "Firebase", "Wagmi", "RainbowKit"],
        icon: "hub.logo"
      },
      {
        name: "HUB Vote",
        description: "Governance voting platform for community decisions and project proposals",
        status: "🟢 Live",
        links: {
          live: "https://hub-portal-vote.vercel.app/",
          github: "https://github.com/Hub-Ecosystem-Portal/Hub-Vote"
        },
        tech: ["Next.js", "The Graph", "Celo Governance"],
        icon: "hub.logo"
      },
      {
        name: "GM Hub Ecosystem",
        description: "Daily GM messaging dApp for community engagement and morning greetings",
        status: "🟢 Live",
        links: {
          live: "https://gm-dapp-hub-ecosystem.vercel.app/",
          github: "https://github.com/Hub-Ecosystem-Portal/HUB-DailyGm"
        },
        tech: ["React", "Web3", "Social"],
        icon: "hub.logo"
      }
    ]
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

  // Function to render icon - checks if it's a logo file or emoji
  const renderIcon = (icon) => {
    if (icon.includes('.logo') && iconMap[icon]) {
      return (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 overflow-hidden">
          <img 
            src={iconMap[icon]} 
            alt={icon.replace('.logo', '')}
            className="w-8 h-8 object-contain"
          />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform flex-shrink-0">
        {icon}
      </div>
    );
  };

  // Function to render category icon - checks if it's a logo file or emoji
  const renderCategoryIcon = (icon) => {
    if (icon.includes('.logo') && iconMap[icon]) {
      return (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
          <img 
            src={iconMap[icon]} 
            alt={icon.replace('.logo', '')}
            className="w-10 h-10 object-contain"
          />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    );
  };

  // COMPACT LIST ITEM COMPONENT
  const CompactListItem = ({ item, index, isLink = true }) => {
    const content = (
      <div className="flex items-center gap-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all group">
        {renderIcon(item.icon)}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-cyan-400 truncate">{item.name}</h4>
          <p className="text-gray-400 text-sm truncate">{item.description}</p>
        </div>
        <div className="text-gray-400 group-hover:text-cyan-400 transition-colors flex-shrink-0">
          <span className="text-lg">→</span>
        </div>
      </div>
    );

    if (isLink && item.url !== '#') {
      return (
        <a
          key={index}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      );
    }

    return (
      <div key={index} className="block">
        {content}
      </div>
    );
  };

  // COMPACT PROGRAM ITEM COMPONENT
  const CompactProgramItem = ({ program, onClick }) => (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all group cursor-pointer"
    >
      {renderIcon(program.icon)}
      <div className="flex-1 min-w-0">
        <h4 className="text-base font-bold text-cyan-400 truncate">{program.name}</h4>
        <p className="text-gray-400 text-sm truncate">{program.description}</p>
      </div>
      <div className="text-gray-400 group-hover:text-cyan-400 transition-colors flex-shrink-0">
        <span className="text-lg">→</span>
      </div>
    </div>
  );

  const CeloHubModal = () => {
    if (!isOpen) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="relative w-full max-w-4xl bg-gray-800 border-2 border-cyan-500/40 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
          
          {/* HEADER - FIXED HEIGHT */}
          <div className="bg-gray-800 border-b border-cyan-500/30 p-6 rounded-t-3xl flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                  🌐 Celo Ecosystem Hub
                </h2>
                <p className="text-gray-400">
                  {expandedBadge 
                    ? [...buildersPrograms[language], ...activeCeloPrograms[language]].find(b => b.id === expandedBadge)?.name
                    : categories[currentView].title
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setExpandedBadge(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl transition-all hover:scale-110 p-2 hover:bg-gray-700/50 rounded-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* NAVIGATION */}
            {!expandedBadge && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(categories).map(([key, { title, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className={`px-3 py-2 rounded-xl font-semibold transition-all border-2 text-sm ${
                      currentView === key
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-700'
                    }`}
                  >
                    {icon} {title}
                  </button>
                ))}
              </div>
            )}

            {/* BACK BUTTON FOR BADGE DETAILS */}
            {expandedBadge && (
              <button
                onClick={() => setExpandedBadge(null)}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all"
              >
                <span className="text-xl">←</span>
                <span>{t.backToBadges}</span>
              </button>
            )}
          </div>

          {/* CONTENT - SCROLLABLE BUT FIXED CONTAINER */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* DASHBOARD VIEW */}
            {currentView === 'dashboard' && !expandedBadge && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(categories).filter(([key]) => key !== 'dashboard').map(([key, { title, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className="flex items-center gap-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all group text-left"
                  >
                    {renderCategoryIcon(icon)}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-cyan-400 mb-1">{title}</h3>
                      <p className="text-gray-400 text-sm">
                        {key === 'badges' && t.badgesDesc}
                        {key === 'defi' && t.defiDesc}
                        {key === 'exchange' && t.exchangeDesc}
                        {key === 'nfts' && t.nftsDesc}
                        {key === 'tools' && t.toolsDesc}
                        {key === 'wallets' && t.walletsDesc}
                        {key === 'impact' && t.impactDesc}
                        {key === 'community' && t.communityDesc}
                        {key === 'hub' && t.hubDesc}
                      </p>
                    </div>
                    <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                      <span className="text-xl">→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* BUILDERS PROGRAM VIEW */}
            {currentView === 'badges' && !expandedBadge && (
              <div className="space-y-6">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">🎖️ {t.celoProgramsHeader}</h3>
                  <p className="text-gray-300">
                    {t.celoProgramsText}
                  </p>
                </div>

                <div className="space-y-3">
                  {[...buildersPrograms[language], ...activeCeloPrograms[language]].map((program) => (
                    <CompactProgramItem 
                      key={program.id}
                      program={program}
                      onClick={() => setExpandedBadge(program.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* BADGE DETAIL VIEW */}
            {expandedBadge && (
              <div className="space-y-6">
                {[...buildersPrograms[language], ...activeCeloPrograms[language]].filter(badge => badge.id === expandedBadge).map((badge) => (
                  <div key={badge.id} className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      {renderCategoryIcon(badge.icon)}
                      <div>
                        <h3 className="text-2xl font-bold text-cyan-400">{badge.name}</h3>
                        <p className="text-gray-400">{badge.category}</p>
                      </div>
                    </div>

                    {/* STANDARD LAYOUT FOR ALL PROGRAMS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">📖 {t.whyItMatters}</h4>
                          <p className="text-gray-300 text-sm">{badge.whyItMatters}</p>
                        </div>

                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">🛣️ {t.howToProgress}</h4>
                          <ul className="text-gray-300 text-sm space-y-2">
                            {badge.howToProgress.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">🏆 {t.tiers}</h4>
                          <ul className="text-gray-300 text-sm space-y-2">
                            {badge.tiers.map((tier, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{tier}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">🔗 {t.links}</h4>
                          <div className="space-y-2">
                            {badge.links.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
                              >
                                <span>→</span>
                                <span>{link.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STANDARD LIST VIEWS */}
            {!expandedBadge && [
              'defi', 'exchange', 'nfts', 'tools', 'wallets', 'impact', 'community'
            ].includes(currentView) && (
              <div className="space-y-3">
                {(
                  currentView === 'defi' ? defiProjects :
                  currentView === 'exchange' ? exchangePlatforms :
                  currentView === 'nfts' ? nftPlatforms :
                  currentView === 'tools' ? developerTools :
                  currentView === 'wallets' ? wallets :
                  currentView === 'impact' ? socialImpact :
                  communityResources
                ).map((item, index) => (
                  <CompactListItem 
                    key={index}
                    item={item}
                    index={index}
                    isLink={item.url !== '#'}
                  />
                ))}
              </div>
            )}

            {/* HUB ECOSYSTEM VIEW */}
            {currentView === 'hub' && !expandedBadge && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">💫 {t.hubEcosystemHeader}</h3>
                  <p className="text-gray-300">
                    {t.hubEcosystemText}
                  </p>
                </div>

                <div className="space-y-3">
                  {hubProjects[language].map((project, index) => (
                    <div key={index} className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 hover:border-green-500/50 transition-all">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            {renderIcon(project.icon)}
                            <h4 className="text-lg font-bold text-green-400">{project.name}</h4>
                          </div>
                          <span className="px-2 py-1 bg-gray-600/50 rounded-lg text-xs font-bold text-gray-300">
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{project.description}</p>
                        
                        {project.token && (
                          <div>
                            <p className="text-green-400 font-semibold mb-1 text-sm">{t.tokenAddress}:</p>
                            <p className="text-gray-400 text-xs font-mono">{project.token}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, techIndex) => (
                            <span key={techIndex} className="px-2 py-1 bg-gray-600/30 rounded-lg text-xs text-gray-400">
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {Object.entries(project.links).map(([key, url]) => (
                            <a
                              key={key}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 hover:bg-green-500/30 transition-all text-xs"
                            >
                              <span>🔗</span>
                              <span className="capitalize">{key}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg"
      >
        {/* ZMIENIONE: Zamiast emoji 🌐 użyj logo Celo */}
        <img 
          src={CeloLogo} 
          alt="Celo Ecosystem" 
          className="w-5 h-5 object-contain"
        />
        <span>Celo Ecosystem Hub</span>
      </button>

      <CeloHubModal />
    </>
  );
};

export default CeloHub;