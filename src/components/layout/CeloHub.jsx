import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const CeloHub = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [expandedBadge, setExpandedBadge] = useState(null);

  // MAIN CATEGORIES
  const categories = {
    dashboard: {
      title: "Ecosystem Dashboard",
      icon: "🏠"
    },
    badges: {
      title: "Badges & Programs",
      icon: "🎖️"
    },
    defi: {
      title: "DeFi & Exchange",
      icon: "💹"
    },
    nfts: {
      title: "NFT & Digital Assets",
      icon: "🖼️"
    },
    tools: {
      title: "Developer Tools",
      icon: "🛠️"
    },
    wallets: {
      title: "Wallets",
      icon: "👛"
    },
    impact: {
      title: "Social Impact",
      icon: "🌍"
    },
    community: {
      title: "Community & Social",
      icon: "👥"
    },
    hub: {
      title: "HUB Ecosystem",
      icon: "💫"
    }
  };

  // BADGES & PROGRAMS DATA
  const prosperityBadges = [
    {
      id: 'karma-gap',
      name: "Karma Gap",
      category: "Identity & Reputation",
      icon: "🔄",
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
      id: 'talent-protocol',
      name: "Talent Protocol", 
      category: "Professional Network",
      icon: "💼",
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
      id: 'celo-programs',
      name: "Active Celo Programs",
      category: "Ecosystem Programs",
      icon: "🚀",
      description: "Official Celo ecosystem programs and initiatives",
      whyItMatters: "Celo offers various programs to support builders, creators, and community members in contributing to ecosystem growth and earning rewards for their participation.",
      howToProgress: [
        "Visit the Celo Programs page",
        "Check eligibility for different programs",
        "Submit applications or contributions",
        "Track your progress and earn rewards"
      ],
      tiers: [
        "Program Participant",
        "Active Contributor",
        "Ecosystem Builder",
        "Program Ambassador"
      ],
      links: [
        { name: "Programs Overview", url: "https://www.celopg.eco/programs" },
        { name: "Apply Now", url: "https://www.celopg.eco/apply" }
      ]
    }
  ];

  // DeFi & EXCHANGES DATA
  const defiProjects = [
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
    },
    {
      name: "Double",
      description: "DeFi gaming and yield platform",
      url: "https://www.double2win.xyz/",
      icon: "🎯"
    },
    {
      name: "ImmortalX",
      description: "Advanced DeFi strategies and vaults",
      url: "https://www.immortalx.io/",
      icon: "⚡"
    }
  ];

  // NFT PLATFORMS
  const nftPlatforms = [
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
    },
    {
      name: "Tatum",
      description: "NFT minting and management platform",
      url: "https://tatum.io/",
      icon: "🔗"
    },
    {
      name: "Mintdropz",
      description: "NFT drops and collections",
      url: "https://mintdropz.com/",
      icon: "🪂"
    },
    {
      name: "Plastiks",
      description: "NFTs for plastic waste reduction",
      url: "https://plastiks.io/",
      icon: "♻️"
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

  // HUB ECOSYSTEM PROJECTS
  const hubProjects = [
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
      tech: ["React", "Web3", "Community"]
    },
    {
      name: "HUB Chat",
      description: "Decentralized social chat application on Celo with real-time messaging",
      status: "🟢 Live",
      links: {
        live: "https://hub-portal-chat.vercel.app/",
        github: "https://github.com/Hub-Ecosystem-Portal/Hub-Chat"
      },
      tech: ["React", "Firebase", "Wagmi", "RainbowKit"]
    },
    {
      name: "HUB Vote",
      description: "Governance voting platform for community decisions and project proposals",
      status: "🟢 Live",
      links: {
        live: "https://hub-portal-vote.vercel.app/",
        github: "https://github.com/Hub-Ecosystem-Portal/Hub-Vote"
      },
      tech: ["Next.js", "The Graph", "Celo Governance"]
    },
    {
      name: "GM Hub Ecosystem",
      description: "Daily GM messaging dApp for community engagement and morning greetings",
      status: "🟢 Live",
      links: {
        live: "https://gm-dapp-hub-ecosystem.vercel.app/",
        github: "https://github.com/Hub-Ecosystem-Portal/HUB-DailyGm"
      },
      tech: ["React", "Web3", "Social"]
    }
  ];

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

  const CeloHubModal = () => {
    if (!isOpen) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="relative w-full max-w-6xl bg-gray-800 border-2 border-cyan-500/40 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
          
          {/* HEADER - FIXED HEIGHT */}
          <div className="bg-gray-800 border-b border-cyan-500/30 p-6 rounded-t-3xl flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
                  🌐 Celo Ecosystem Hub
                </h2>
                <p className="text-gray-400">
                  {expandedBadge 
                    ? prosperityBadges.find(b => b.id === expandedBadge)?.name
                    : categories[currentView].title
                  }
                </p>
              </div>
              
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
                <span>Back to Badges</span>
              </button>
            )}
          </div>

          {/* CONTENT - SCROLLABLE BUT FIXED CONTAINER */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* DASHBOARD VIEW */}
            {currentView === 'dashboard' && !expandedBadge && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categories).filter(([key]) => key !== 'dashboard').map(([key, { title, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key)}
                    className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-gray-700/80 transition-all text-left group h-32"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-cyan-400 mb-1">{title}</h3>
                        <p className="text-gray-400 text-sm">
                          {key === 'badges' && "Karma Gap, Talent Protocol, Celo Programs"}
                          {key === 'defi' && "Uniswap, Mento, Ubeswap, Curve"}
                          {key === 'nfts' && "OpenSea, Rarible, Tatum, Mintdropz"}
                          {key === 'tools' && "Alchemy, Infura, QuickNode, thirdweb"}
                          {key === 'wallets' && "MetaMask, Valora, Celo Terminal"}
                          {key === 'impact' && "Mercy Corps, Grameen, GoodDollar"}
                          {key === 'community' && "Forum, Twitter, GitHub, Blog"}
                          {key === 'hub' && "HUB Chat, HUB Vote, GM Hub"}
                        </p>
                      </div>
                      <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                        <span className="text-xl">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* BADGES VIEW */}
            {currentView === 'badges' && !expandedBadge && (
              <div className="space-y-6">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">🎖️ Celo Programs & Identity</h3>
                  <p className="text-gray-300">
                    Discover programs and identity solutions that help you build reputation and earn rewards 
                    across the Celo ecosystem through verified contributions and participation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prosperityBadges.map((badge) => (
                    <div 
                      key={badge.id}
                      className="bg-gray-700/60 border border-gray-600/50 rounded-2xl p-6 transition-all hover:border-cyan-500/50 hover:bg-gray-700/80 cursor-pointer group h-48"
                      onClick={() => setExpandedBadge(badge.id)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-cyan-400 mb-1">{badge.name}</h4>
                          <p className="text-gray-400 text-sm">{badge.category}</p>
                        </div>
                        <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                          <span className="text-xl">→</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BADGE DETAIL VIEW */}
            {expandedBadge && (
              <div className="space-y-6">
                {prosperityBadges.filter(badge => badge.id === expandedBadge).map((badge) => (
                  <div key={badge.id} className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-cyan-400">{badge.name}</h3>
                        <p className="text-gray-400">{badge.category}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">📖 Why It Matters</h4>
                          <p className="text-gray-300 text-sm">{badge.whyItMatters}</p>
                        </div>

                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6">
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">🛣️ How to Progress</h4>
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
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">🏆 Tiers</h4>
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
                          <h4 className="text-lg font-bold text-cyan-400 mb-3">🔗 Links</h4>
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

            {/* STANDARD GRID VIEWS */}
            {!expandedBadge && [
              'defi', 'nfts', 'tools', 'wallets', 'impact', 'community'
            ].includes(currentView) && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(
                  currentView === 'defi' ? defiProjects :
                  currentView === 'nfts' ? nftPlatforms :
                  currentView === 'tools' ? developerTools :
                  currentView === 'wallets' ? wallets :
                  currentView === 'impact' ? socialImpact :
                  communityResources
                ).map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col p-6 bg-gray-700/50 border border-gray-600/50 rounded-2xl hover:border-cyan-500/50 hover:bg-gray-700/80 transition-all group h-48"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-bold text-cyan-400 mb-2">{item.name}</h4>
                    <p className="text-gray-400 text-sm flex-1">{item.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-cyan-400 text-sm">Visit →</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* HUB ECOSYSTEM VIEW */}
            {currentView === 'hub' && !expandedBadge && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">💫 HUB Ecosystem</h3>
                  <p className="text-gray-300">
                    A growing collection of open-source projects developed by the HUB community, 
                    focused on building tools and infrastructure for the Celo ecosystem.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {hubProjects.map((project, index) => (
                    <div key={index} className="bg-gray-700/50 border border-gray-600/50 rounded-2xl p-6 hover:border-green-500/50 transition-all">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-bold text-green-400">{project.name}</h4>
                            <span className="px-2 py-1 bg-gray-600/50 rounded-lg text-xs font-bold text-gray-300">
                              {project.status}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-4 text-sm">{project.description}</p>
                          
                          {project.token && (
                            <div className="mb-4">
                              <p className="text-green-400 font-semibold mb-1 text-sm">Token Address:</p>
                              <p className="text-gray-400 text-xs font-mono">{project.token}</p>
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {project.tech.map((tech, techIndex) => (
                              <span key={techIndex} className="px-2 py-1 bg-gray-600/30 rounded-lg text-xs text-gray-400">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {Object.entries(project.links).map(([key, url]) => (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300 hover:bg-green-500/30 transition-all text-sm"
                              >
                                <span>🔗</span>
                                <span className="capitalize">{key}</span>
                              </a>
                            ))}
                          </div>
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
        <span className="text-sm">🌐</span>
        <span>Celo Ecosystem Hub</span>
      </button>

      <CeloHubModal />
    </>
  );
};

export default CeloHub;