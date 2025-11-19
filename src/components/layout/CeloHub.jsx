import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import TalentLogo from "/src/assets/logos/talent.jpg";
import KarmaLogo from "/src/assets/logos/karmaGap.jpg";
import ProsperityLogo from "/src/assets/logos/prosperity.png";
import CeloPGLogo from "/src/assets/logos/celopublic.png";
import HubLogo from "/src/assets/logos/hub.jpg";
import CeloLogo from "/src/assets/logos/celo.jpg";

const translations = {
  en: {
    dashboard: "Ecosystem Dashboard",
    badges: "Builders Program",
    defi: "DeFi",
    exchange: "Exchange",
    nfts: "NFT Platforms",
    tools: "Developer Tools",
    wallets: "Wallets",
    impact: "Social Impact",
    community: "Community & Social",
    hub: "HUB Ecosystem",
    
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
    
    karmaGapDesc: "Decentralized identity and reputation protocol building on Celo",
    talentProtocolDesc: "Web3 professional network and talent discovery platform", 
    celoProgramsDesc: "Official Celo ecosystem programs and initiatives",
    
    celoProgramsHeader: "Builders Programs",
    celoProgramsText: "Discover programs and identity solutions that help you build reputation and earn rewards across the Celo ecosystem through verified contributions and participation.",
    hubEcosystemHeader: "HUB Ecosystem",
    hubEcosystemText: "A growing collection of open-source projects developed by the HUB community, focused on building tools and infrastructure for the Celo ecosystem.",
    
    tokenAddress: "Token Address",
    
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

const CeloHub = ({ isMobile = false, showButton = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [expandedBadge, setExpandedBadge] = useState(null);
  const [language] = useState('en');

  const t = translations[language];

  const iconMap = {
    'talent.logo': TalentLogo,
    'karma.logo': KarmaLogo,
    'prosperity.logo': ProsperityLogo,
    'celopg.logo': CeloPGLogo,
    'hub.logo': HubLogo,
    'celo.logo': CeloLogo,
  };

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

  const buildersPrograms = {
    en: [
      {
        id: 'talent-protocol',
        name: "Talent Protocol", 
        category: isMobile ? "Network" : "Professional Network",
        icon: "talent.logo",
        description: isMobile ? "Web3 professional network" : "Web3 professional network and talent discovery platform",
        whyItMatters: isMobile ? 
          "Showcase skills and build professional reputation with verifiable on-chain credentials." :
          "Talent Protocol enables builders and creators to showcase their skills, build professional reputation, and connect with opportunities in the Celo ecosystem through verifiable on-chain credentials.",
        howToProgress: isMobile ? [
          "Create profile",
          "Connect accounts",
          "Earn badges",
          "Build reputation"
        ] : [
          "Create your Talent Protocol profile",
          "Connect your GitHub and other professional accounts",
          "Earn skills badges through contributions",
          "Build your Builder Score reputation"
        ],
        tiers: isMobile ? [
          "Score 100+",
          "Score 500+",
          "Score 1000+",
          "Top Talent"
        ] : [
          "Builder Score 100+",
          "Builder Score 500+",
          "Builder Score 1000+",
          "Top Talent Tier"
        ],
        links: [
          { name: isMobile ? "Website" : "Official Website", url: "https://talentprotocol.com/" },
          { name: "Celo Integration", url: "https://talentprotocol.com/celo" }
        ]
      },
      {
        id: 'karma-gap',
        name: "Karma Gap",
        category: isMobile ? "Identity" : "Identity & Reputation",
        icon: "karma.logo",
        description: isMobile ? "Identity & reputation protocol" : "Decentralized identity and reputation protocol building on Celo",
        whyItMatters: isMobile ? 
          "Build verifiable reputation across Celo ecosystem for trustless interactions." :
          "Karma Gap provides decentralized identity solutions that help users build verifiable reputation across the Celo ecosystem, enabling trustless interactions and personalized experiences.",
        howToProgress: isMobile ? [
          "Connect wallet",
          "Verify identity",
          "Build reputation",
          "Use across dApps"
        ] : [
          "Connect your wallet to Karma Gap platform",
          "Complete identity verification steps",
          "Build your reputation through ecosystem participation",
          "Use your Karma identity across supported dApps"
        ],
        tiers: isMobile ? [
          "Basic ID",
          "Level 1",
          "Level 2", 
          "Advanced"
        ] : [
          "Basic Identity Verification",
          "Reputation Level 1",
          "Reputation Level 2", 
          "Advanced Reputation Tier"
        ],
        links: [
          { name: isMobile ? "Website" : "Official Website", url: "https://www.karmahq.xyz/" },
          { name: isMobile ? "Docs" : "Documentation", url: "https://docs.karmahq.xyz/" }
        ]
      },
      {
        id: 'prosperity-pass',
        name: "Prosperity Pass",
        category: isMobile ? "Access" : "Ecosystem Access",
        icon: "prosperity.logo",
        description: isMobile ? "Ecosystem access pass" : "Access pass for Celo ecosystem benefits and rewards",
        whyItMatters: isMobile ?
          "Exclusive access to ecosystem benefits and rewards within Celo network." :
          "Prosperity Pass provides exclusive access to ecosystem benefits, rewards, and opportunities within the Celo network, helping builders and users maximize their participation.",
        howToProgress: isMobile ? [
          "Visit website",
          "Verify eligibility",
          "Claim pass",
          "Earn rewards"
        ] : [
          "Visit the Prosperity Pass website",
          "Connect your wallet and verify eligibility",
          "Claim your pass and start earning rewards",
          "Participate in exclusive ecosystem activities"
        ],
        tiers: isMobile ? [
          "Basic",
          "Active",
          "Contributor",
          "Premium"
        ] : [
          "Basic Pass Holder",
          "Active Participant",
          "Ecosystem Contributor",
          "Premium Member"
        ],
        links: [
          { name: isMobile ? "Website" : "Official Website", url: "https://pass.celopg.eco/welcome" },
          { name: "Get Started", url: "https://pass.celopg.eco/welcome" }
        ]
      }
    ]
  };

  const defiProjects = [
    {
      name: "Aave",
      description: isMobile ? "Lending protocol" : "Leading decentralized lending protocol on Celo",
      url: "https://app.aave.com/",
      icon: "🏦"
    },
    {
      name: "Uniswap",
      description: isMobile ? "DEX protocol" : "Leading decentralized exchange protocol",
      url: "https://uniswap.org/",
      icon: "🦄"
    },
    {
      name: "Mento",
      description: isMobile ? "Stablecoin protocol" : "Celo's native stablecoin protocol", 
      url: "https://www.mento.org/",
      icon: "🌊"
    },
    {
      name: "Ubeswap",
      description: isMobile ? "DeFi platform" : "DeFi platform on Celo with yield farming",
      url: "https://ubeswap.org/",
      icon: "🍀"
    }
  ];

  const exchangePlatforms = [
    {
      name: isMobile ? "Coming soon" : "More exchanges coming soon",
      description: isMobile ? "More exchanges coming" : "We're working on adding major exchanges to the Celo ecosystem",
      url: "#",
      icon: "🚧"
    }
  ];

  const nftPlatforms = [
    {
      name: "Celosphere",
      description: isMobile ? "NFT marketplace" : "Premier NFT marketplace and community on Celo",
      url: "https://celosphere.xyz/",
      icon: "🌐"
    },
    {
      name: "OpenSea",
      description: isMobile ? "NFT marketplace" : "Largest NFT marketplace with Celo support",
      url: "https://opensea.io/",
      icon: "🌊"
    }
  ];

  const developerTools = [
    {
      name: "Alchemy",
      description: isMobile ? "Celo API" : "Celo chain API and development platform",
      url: "https://docs.alchemy.com/reference/celo-chain-api-quickstart",
      icon: "⚗️"
    },
    {
      name: "Infura",
      description: isMobile ? "Infrastructure" : "Blockchain infrastructure for Celo",
      url: "https://www.infura.io/networks/celo",
      icon: "🏗️"
    },
    {
      name: "QuickNode",
      description: isMobile ? "Node infra" : "Celo node infrastructure",
      url: "https://www.quicknode.com/docs/celo",
      icon: "⚡"
    },
    {
      name: "thirdweb",
      description: isMobile ? "Web3 framework" : "Web3 development framework for Celo",
      url: "https://thirdweb.com/celo",
      icon: "🛠️"
    }
  ];

  const wallets = [
    {
      name: "MetaMask",
      description: isMobile ? "Browser wallet" : "Browser and mobile wallet with Celo support",
      url: "https://docs.celo.org/wallet/metamask/use",
      icon: "🦊"
    },
    {
      name: "Valora",
      description: isMobile ? "Mobile wallet" : "Mobile-first wallet for Celo ecosystem",
      url: "https://support.valoraapp.com/hc/articles/360061350071",
      icon: "📱"
    },
    {
      name: "Celo Terminal",
      description: isMobile ? "Desktop wallet" : "Desktop wallet for Celo",
      url: "https://celoterminal.com/",
      icon: "💻"
    }
  ];

  const socialImpact = [
    {
      name: "Mercy Corps",
      description: isMobile ? "Humanitarian aid" : "Humanitarian aid and financial inclusion",
      url: "https://www.mercycorps.org/",
      icon: "🤝"
    },
    {
      name: "Grameen Foundation",
      description: isMobile ? "Microfinance" : "Poverty alleviation through microfinance",
      url: "https://grameenfoundation.org/",
      icon: "🏦"
    }
  ];

  const communityResources = [
    {
      name: "Celo Website",
      description: isMobile ? "Official site" : "Official Celo website",
      url: "https://celo.org/",
      icon: "🌐"
    },
    {
      name: isMobile ? "Forum" : "Governance Forum",
      description: isMobile ? "Governance" : "Celo governance discussions and proposals",
      url: "https://forum.celo.org/c/governance/12",
      icon: "🗳️"
    },
    {
      name: "Twitter",
      description: isMobile ? "Updates" : "Official Celo Twitter account",
      url: "https://twitter.com/CeloOrg",
      icon: "🐦"
    },
    {
      name: "GitHub",
      description: isMobile ? "Code" : "Celo open source repositories",
      url: "https://github.com/celo-org",
      icon: "💻"
    }
  ];

  const activeCeloPrograms = {
    en: [
      {
        id: 'celo-programs',
        name: "Celo Public Goods",
        category: isMobile ? "Funding" : "Ecosystem Funding",
        icon: "celopg.logo",
        description: isMobile ? "Celo ecosystem funding programs" : "Celo Public Goods (CeloPG) was created to streamline the Celo Community Governance and Treasury coordination and, through builder programs, help accelerate and strengthen the Celo ecosystem.",
        whyItMatters: isMobile ?
          "Funding for public goods that benefit the entire Celo ecosystem through community-driven initiatives." :
          "Celo Public Goods provides funding and support for public goods that benefit the entire Celo ecosystem, helping to accelerate development and strengthen the network through community-driven initiatives.",
        howToProgress: isMobile ? [
          "Visit website",
          "Explore programs",
          "Submit proposal",
          "Join governance"
        ] : [
          "Visit the Celo Public Goods website",
          "Explore available funding programs",
          "Submit your project proposal",
          "Participate in community governance"
        ],
        tiers: isMobile ? [
          "Applicant",
          "Approved", 
          "Funded",
          "Partner"
        ] : [
          "Project Applicant",
          "Approved Project", 
          "Funded Initiative",
          "Ecosystem Partner"
        ],
        links: [
          { name: isMobile ? "Website" : "Official Website", url: "https://www.celopg.eco/" },
          { name: isMobile ? "Programs" : "Programs Overview", url: "https://www.celopg.eco/programs" },
          { name: "Apply Now", url: "https://www.celopg.eco/apply" }
        ]
      }
    ]
  };

  const hubProjects = {
    en: [
      {
        name: isMobile ? "HUB Portal" : "HUB Ecosystem Portal",
        description: isMobile ? "Main ecosystem website and hub" : "Main website and ecosystem hub for all HUB projects and community initiatives",
        status: "🟢 Live",
        links: {
          website: "https://hubecosystem.xyz/",
          github: "https://github.com/Hub-Ecosystem-Portal/HubEcosystem",
          twitter: "https://x.com/HUB_Ecosystem",
          discord: "https://discord.gg/eVC4C5tdZq"
        },
        token: isMobile ? "0x58EFD...36B3E" : "0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E (Base)",
        tech: isMobile ? ["React", "Web3"] : ["React", "Web3", "Community"],
        icon: "hub.logo"
      },
      {
        name: "HUB Chat",
        description: isMobile ? "Decentralized social chat" : "Decentralized social chat application on Celo with real-time messaging",
        status: "🟢 Live",
        links: {
          live: "https://hub-portal-chat.vercel.app/",
          github: "https://github.com/Hub-Ecosystem-Portal/Hub-Chat"
        },
        tech: isMobile ? ["React", "Firebase"] : ["React", "Firebase", "Wagmi", "RainbowKit"],
        icon: "hub.logo"
      },
      {
        name: "HUB Vote",
        description: isMobile ? "Governance voting platform" : "Governance voting platform for community decisions and project proposals",
        status: "🟢 Live",
        links: {
          live: "https://hub-portal-vote.vercel.app/",
          github: "https://github.com/Hub-Ecosystem-Portal/Hub-Vote"
        },
        tech: isMobile ? ["Next.js", "The Graph"] : ["Next.js", "The Graph", "Celo Governance"],
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

  const CompactListItem = ({ item, index, isLink = true }) => {
    const content = (
      <div className={`flex items-center bg-gray-700/30 border border-gray-600/30 rounded-xl hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all group ${
        isMobile ? 'gap-3 p-3' : 'gap-4 p-4'
      }`}>
        {renderIcon(item.icon)}
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-cyan-400 truncate ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>{item.name}</h4>
          <p className={`text-gray-400 truncate ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>{item.description}</p>
        </div>
        <div className="text-gray-400 group-hover:text-cyan-400 transition-colors flex-shrink-0">
          <span className={isMobile ? 'text-sm' : 'text-lg'}>→</span>
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

  const CompactProgramItem = ({ program, onClick }) => (
    <div 
      onClick={onClick}
      className={`flex items-center bg-gray-700/30 border border-gray-600/30 rounded-xl hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all group cursor-pointer ${
        isMobile ? 'gap-3 p-3' : 'gap-4 p-4'
      }`}
    >
      {renderIcon(program.icon)}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-cyan-400 truncate ${
          isMobile ? 'text-sm' : 'text-base'
        }`}>{program.name}</h4>
        <p className={`text-gray-400 truncate ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>{program.description}</p>
      </div>
      <div className="text-gray-400 group-hover:text-cyan-400 transition-colors flex-shrink-0">
        <span className={isMobile ? 'text-sm' : 'text-lg'}>→</span>
      </div>
    </div>
  );

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
                  {isMobile ? '🌐 Celo Hub' : '🌐 Celo Ecosystem Hub'}
                </h2>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : ''}`}>
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

            {expandedBadge && (
              <button
                onClick={() => setExpandedBadge(null)}
                className={`flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all ${
                  isMobile ? 'text-sm gap-1' : ''
                }`}
              >
                <span className={isMobile ? 'text-lg' : 'text-xl'}>←</span>
                <span>{t.backToBadges}</span>
              </button>
            )}
          </div>

          <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
            
            {currentView === 'dashboard' && !expandedBadge && (
              <div className={`grid gap-4 ${
                isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'
              }`}>
                {Object.entries(categories).filter(([key]) => key !== 'dashboard').map(([key, { title, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className="flex items-center gap-4 p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl hover:border-cyan-500/50 hover:bg-gray-700/50 transition-all group text-left"
                  >
                    {renderCategoryIcon(icon)}
                    <div className="flex-1">
                      <h3 className={`font-bold text-cyan-400 mb-1 ${
                        isMobile ? 'text-sm' : 'text-lg'
                      }`}>{title}</h3>
                      <p className={`text-gray-400 ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
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
                      <span className={isMobile ? 'text-sm' : 'text-xl'}>→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentView === 'badges' && !expandedBadge && (
              <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
                {!isMobile && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">🎖️ {t.celoProgramsHeader}</h3>
                    <p className="text-gray-300">
                      {t.celoProgramsText}
                    </p>
                  </div>
                )}

                <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
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

            {expandedBadge && (
              <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                {[...buildersPrograms[language], ...activeCeloPrograms[language]].filter(badge => badge.id === expandedBadge).map((badge) => (
                  <div key={badge.id} className="space-y-6">
                    <div className={`flex items-center gap-4 ${isMobile ? 'mb-4' : 'mb-6'}`}>
                      {renderCategoryIcon(badge.icon)}
                      <div>
                        <h3 className={`font-bold text-cyan-400 ${
                          isMobile ? 'text-lg' : 'text-2xl'
                        }`}>{badge.name}</h3>
                        <p className={`text-gray-400 ${isMobile ? 'text-xs' : ''}`}>{badge.category}</p>
                      </div>
                    </div>

                    <div className={`grid gap-6 ${
                      isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 lg:grid-cols-2 gap-6'
                    }`}>
                      <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className={`font-bold text-cyan-400 mb-3 ${
                            isMobile ? 'text-sm' : 'text-lg'
                          }`}>📖 {t.whyItMatters}</h4>
                          <p className={`text-gray-300 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>{badge.whyItMatters}</p>
                        </div>

                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className={`font-bold text-cyan-400 mb-3 ${
                            isMobile ? 'text-sm' : 'text-lg'
                          }`}>🛣️ {t.howToProgress}</h4>
                          <ul className={`text-gray-300 space-y-2 ${
                            isMobile ? 'text-xs space-y-1' : 'text-sm space-y-2'
                          }`}>
                            {badge.howToProgress.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
                        {!isMobile && (
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
                        )}

                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className={`font-bold text-cyan-400 mb-3 ${
                            isMobile ? 'text-sm' : 'text-lg'
                          }`}>🔗 {t.links}</h4>
                          <div className={isMobile ? 'space-y-1' : 'space-y-2'}>
                            {badge.links.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors ${
                                  isMobile ? 'text-xs gap-1' : 'text-sm'
                                }`}
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

            {!expandedBadge && [
              'defi', 'exchange', 'nfts', 'tools', 'wallets', 'impact', 'community'
            ].includes(currentView) && (
              <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
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

            {currentView === 'hub' && !expandedBadge && (
              <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
                {!isMobile && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-green-400 mb-2">💫 {t.hubEcosystemHeader}</h3>
                    <p className="text-gray-300">
                      {t.hubEcosystemText}
                    </p>
                  </div>
                )}

                <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
                  {hubProjects[language].map((project, index) => (
                    <div key={index} className={`bg-gray-700/50 border border-gray-600/50 rounded-xl hover:border-green-500/50 transition-all ${
                      isMobile ? 'p-3' : 'p-4'
                    }`}>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            {renderIcon(project.icon)}
                            <h4 className={`font-bold text-green-400 ${
                              isMobile ? 'text-sm' : 'text-lg'
                            }`}>{project.name}</h4>
                          </div>
                          <span className={`px-2 py-1 bg-gray-600/50 rounded-lg font-bold text-gray-300 ${
                            isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className={`text-gray-300 ${
                          isMobile ? 'text-xs' : 'text-sm'
                        }`}>{project.description}</p>
                        
                        {project.token && (
                          <div>
                            <p className={`text-green-400 font-semibold mb-1 ${
                              isMobile ? 'text-xs' : 'text-sm'
                            }`}>{t.tokenAddress}:</p>
                            <p className={`text-gray-400 font-mono ${
                              isMobile ? 'text-xs' : 'text-xs'
                            }`}>{project.token}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {project.tech.map((tech, techIndex) => (
                            <span key={techIndex} className={`px-2 py-1 bg-gray-600/30 rounded-lg text-gray-400 ${
                              isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'
                            }`}>
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
                              className={`inline-flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 hover:bg-green-500/30 transition-all ${
                                isMobile ? 'px-2 py-0.5 text-xs gap-1' : 'px-3 py-1 text-xs'
                              }`}
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
      {showButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg ${
            isMobile ? 'px-3 py-1.5 text-xs gap-1' : 'px-4 py-2 text-sm'
          }`}
        >
          <img 
            src={CeloLogo} 
            alt="Celo Ecosystem" 
            className={isMobile ? 'w-4 h-4 object-contain' : 'w-5 h-5 object-contain'}
          />
          <span>{isMobile ? 'Celo Hub' : 'Celo Ecosystem Hub'}</span>
        </button>
      )}

      <CeloHubModal />
    </>
  );
};

export default CeloHub;