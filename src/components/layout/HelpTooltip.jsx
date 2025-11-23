import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translations, getBrowserLanguage } from '../../utils/translations';
import { ADMIN_ADDRESSES } from '../../utils/constants';
import { useAccount } from 'wagmi';

const HelpTooltip = ({ isMobile = false, showButton = true, isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [language, setLanguage] = useState(getBrowserLanguage());
  const tooltipRef = useRef(null);
  const { address } = useAccount();

  const showTooltip = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const t = translations[language];
  const helpSections = t.sections;

  const isAdmin = address && ADMIN_ADDRESSES.includes(address.toLowerCase());

  const adminFormattingSection = {
    id: 'admin-formatting',
    icon: '🔗',
    title: language === 'pl' ? 
      (isMobile ? 'Formatowanie (Admin)' : 'Formatowanie Linków (Admin)') : 
      (isMobile ? 'Formatting (Admin)' : 'Link Formatting (Admin)'),
    content: language === 'pl' ? 
      (isMobile ? 
        `📋 FORMATOWANIE\n\n[tweet|tekst|url]\n[video|tekst|url]\n[doc|tekst|url]\nPrzykład:\n[tweet|Test|https://x.com]` :
        `📋 INSTRUKCJE FORMATOWANIA LINKÓW\n\nUżyj składni: [typ|tekst|url]\n\nDostępne typy linków:\n• [tweet|Twój tekst|https://x.com/...] → 📢 Twój tekst\n• [video|Twój tekst|https://youtube.com/...] → 🎥 Twój tekst\nPrzykłady:\n• [tweet|Nowe ogłoszenie|https://x.com/hub/123]`)
      : 
      (isMobile ?
        `📋 FORMATTING\n\n[tweet|text|url]\n[video|text|url]\n[doc|text|url]\nExample:\n[tweet|Test|https://x.com]` :
        `📋 LINK FORMATTING INSTRUCTIONS\n\nUse syntax: [type|text|url]\n\nAvailable link types:\n• [tweet|Your text|https://x.com/...] → 📢 Your text\n• [video|Your text|https://youtube.com/...] → 🎥 Your text\nExamples:\n• [tweet|New announcement|https://x.com/hub/123]`)
  };

  const allSections = isAdmin ? [adminFormattingSection, ...helpSections] : helpSections;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    setExpandedSection(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
      setExpandedSection(null);
    };
  }, [showTooltip]);

  const toggleLanguageHandler = () => {
    setLanguage(prev => prev === 'pl' ? 'en' : 'pl');
  };

  const TooltipContent = () => {
    if (!showTooltip) return null;

    return ReactDOM.createPortal(
      <div className={`fixed inset-0 z-[99999] flex items-start justify-center ${
        isMobile ? 'pt-8 px-3' : 'pt-10 px-4'
      }`}>
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <div 
          ref={tooltipRef}
          className={`relative bg-gray-800 border-2 border-cyan-500/40 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col ${
            isMobile ? 'w-full max-w-sm rounded-2xl max-h-[80vh]' : 'w-full max-w-4xl'
          }`}
        >
          <div className={`bg-gray-800 border-b border-cyan-500/30 flex-shrink-0 ${
            isMobile ? 'p-4' : 'p-8'
          }`}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
              <div>
                <h3 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
                  isMobile ? 'text-lg mb-1' : 'text-3xl mb-2'
                }`}>
                  {t.completeGuide}
                </h3>
                <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-lg'}`}>
                  {expandedSection 
                    ? allSections.find(s => s.id === expandedSection)?.title
                    : t.selectSection
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 bg-gray-700/50 rounded-xl border border-gray-600/50 ${
                  isMobile ? 'p-0.5 gap-1 rounded-lg' : 'p-1'
                }`}>
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`font-medium transition-all ${
                      language === 'pl' 
                        ? 'bg-cyan-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    } ${isMobile ? 'px-2 py-0.5 rounded text-xs' : 'px-3 py-1 rounded-lg text-sm'}`}
                  >
                    PL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`font-medium transition-all ${
                      language === 'en' 
                        ? 'bg-cyan-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    } ${isMobile ? 'px-2 py-0.5 rounded text-xs' : 'px-3 py-1 rounded-lg text-sm'}`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className={`text-gray-400 hover:text-white transition-all hover:scale-110 hover:bg-gray-700/50 rounded-xl ${
                    isMobile ? 'text-lg p-1 rounded-lg' : 'text-2xl p-3 rounded-xl'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {expandedSection ? (
              <div className={isMobile ? 'p-4' : 'p-8'}>
                <button
                  onClick={() => setExpandedSection(null)}
                  className={`flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-all hover:scale-105 ${
                    isMobile ? 'mb-3 text-sm gap-1' : 'mb-6'
                  }`}
                >
                  <span className={isMobile ? 'text-base' : 'text-xl'}>←</span>
                  <span>{t.backToList}</span>
                </button>
                
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
                  <div className={`flex items-center gap-4 ${isMobile ? 'mb-3' : 'mb-6'}`}>
                    <div className={`rounded-2xl flex items-center justify-center ${
                      expandedSection === 'admin-formatting'
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                        : 'bg-cyan-500/20'
                    } ${isMobile ? 'w-10 h-10 text-lg rounded-xl' : 'w-16 h-16 text-2xl'}`}>
                      {allSections.find(s => s.id === expandedSection)?.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold ${
                        expandedSection === 'admin-formatting' ? 'text-purple-400' : 'text-cyan-400'
                      } ${isMobile ? 'text-base' : 'text-2xl'}`}>
                        {allSections.find(s => s.id === expandedSection)?.title}
                        {expandedSection === 'admin-formatting' && (
                          <span className={`text-purple-300 ${
                            isMobile ? 'text-sm ml-1' : 'text-sm ml-2'
                          }`}>👑</span>
                        )}
                      </h4>
                      <p className={`text-gray-400 ${isMobile ? 'text-xs' : ''}`}>
                        {t.section} {expandedSection} {t.of} {allSections.length}
                      </p>
                    </div>
                  </div>

                  <div className={`text-gray-300 leading-relaxed space-y-4 ${
                    isMobile ? 'text-sm space-y-2' : 'text-lg space-y-4'
                  }`}>
                    {allSections.find(s => s.id === expandedSection)?.content.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className="flex items-start gap-3">
                        <span className={`${
                          expandedSection === 'admin-formatting' ? 'text-purple-400' : 'text-cyan-400'
                        } ${isMobile ? 'text-sm mt-0.5' : 'text-xl mt-1'}`}>•</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    ))}
                  </div>

                  <div className={`flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50 ${
                    isMobile ? 'mt-4 pt-3' : 'mt-8 pt-6'
                  }`}>
                    <button
                      onClick={() => {
                        const currentIndex = allSections.findIndex(s => s.id === expandedSection);
                        if (currentIndex > 0) {
                          setExpandedSection(allSections[currentIndex - 1].id);
                        }
                      }}
                      disabled={expandedSection === allSections[0].id}
                      className={`flex items-center gap-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                        isMobile ? 'px-2 py-1 rounded-lg text-xs gap-1' : 'px-4 py-2'
                      }`}
                    >
                      {t.previous}
                    </button>
                    
                    <button
                      onClick={() => {
                        const currentIndex = allSections.findIndex(s => s.id === expandedSection);
                        if (currentIndex < allSections.length - 1) {
                          setExpandedSection(allSections[currentIndex + 1].id);
                        }
                      }}
                      disabled={expandedSection === allSections[allSections.length - 1].id}
                      className={`flex items-center gap-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                        isMobile ? 'px-2 py-1 rounded-lg text-xs gap-1' : 'px-4 py-2'
                      }`}
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={isMobile ? 'p-4' : 'p-8'}>
                <div className={`grid gap-6 ${
                  isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-6'
                }`}>
                  {allSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setExpandedSection(section.id)}
                      className={`bg-gray-700/60 border rounded-2xl transition-all hover:border-cyan-500/50 hover:bg-gray-700/80 hover:transform hover:scale-[1.02] text-left group ${
                        section.id === 'admin-formatting' 
                          ? 'border-purple-500/50 bg-purple-500/10' 
                          : 'border-gray-600/50'
                      } ${isMobile ? 'p-3 rounded-xl' : 'p-6'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${
                          section.id === 'admin-formatting'
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
                            : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                        } ${isMobile ? 'w-8 h-8 text-base rounded-lg' : 'w-14 h-14'}`}>
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                            <span className={`rounded-full flex items-center justify-center text-white ${
                              section.id === 'admin-formatting' ? 'bg-purple-500' : 'bg-cyan-500'
                            } ${isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-xs'}`}>
                              {section.id === 'admin-formatting' ? 'A' : section.id}
                            </span>
                            <h4 className={`font-semibold ${
                              section.id === 'admin-formatting' ? 'text-purple-400' : 'text-cyan-400'
                            } ${isMobile ? 'text-sm' : 'text-lg'}`}>
                              {section.title}
                              {section.id === 'admin-formatting' && (
                                <span className={`text-purple-300 ${
                                  isMobile ? 'text-sm ml-1' : 'text-sm ml-2'
                                }`}>👑</span>
                              )}
                            </h4>
                          </div>
                          <p className={`text-gray-400 ${
                            isMobile ? 'text-xs' : 'text-sm'
                          }`}>
                            {language === 'pl' ? 'Kliknij aby poznać szczegóły...' : 'Click to learn more...'}
                          </p>
                        </div>
                        <div className={`transition-colors ${
                          section.id === 'admin-formatting' ? 'text-purple-400' : 'text-gray-400'
                        } group-hover:text-cyan-400`}>
                          <span className={isMobile ? 'text-sm' : 'text-xl'}>→</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className={`mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl ${
                  isMobile ? 'mt-4 p-3 rounded-xl' : ''
                }`}>
                  <div className="text-center">
                    <p className={`text-purple-400 font-semibold mb-4 ${
                      isMobile ? 'text-sm mb-2' : 'text-xl mb-4'
                    }`}>{t.quickStart}</p>
                    <div className={`grid gap-4 text-gray-300 ${
                      isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-3 gap-4'
                    }`}>
                      {t.quickStartTips.map((tip, index) => (
                        <div key={index} className={`bg-gray-700/50 rounded-xl border border-gray-600/50 ${
                          isMobile ? 'p-2' : 'p-4'
                        }`}>
                          <div className={`mb-2 ${isMobile ? 'text-lg mb-1' : 'text-2xl mb-2'}`}>{tip.icon}</div>
                          <p className={`font-semibold text-cyan-400 ${
                            isMobile ? 'text-xs' : ''
                          }`}>{tip.title}</p>
                          <p className={`mt-2 ${isMobile ? 'text-xs mt-1' : 'text-sm mt-2'}`}>{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`mt-8 text-center border-t border-gray-700/50 pt-6 ${
                  isMobile ? 'mt-4 pt-4' : ''
                }`}>
                  <p className={`text-gray-400 ${
                    isMobile ? 'text-sm' : 'text-lg'
                  }`}>
                    {t.readyToStart}{' '}
                    <span className="text-cyan-400 font-semibold">{t.closeAndJoin}</span>
                  </p>
                </div>
              </div>
            )}
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
          className={`flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg ${
            isMobile ? 'px-3 py-1.5 text-xs gap-1' : 'px-4 py-2 text-sm'
          }`}
        >
          <span className={isMobile ? 'text-sm' : 'text-sm'}>❓</span>
          <span>{isMobile ? 'Guide' : 'Quick Guide'}</span>
        </button>
      )}

      <TooltipContent />
    </>
  );
};

export default HelpTooltip;