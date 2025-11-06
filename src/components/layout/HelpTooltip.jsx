// src/components/layout/HelpTooltip.jsx
import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translations, getBrowserLanguage } from '../../utils/translations';

const HelpTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [language, setLanguage] = useState(getBrowserLanguage());
  const tooltipRef = useRef(null);

  const t = translations[language];
  const helpSections = t.sections;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
        setExpandedSection(null);
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
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-10 px-4">
        {/* Overlay tła */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowTooltip(false);
            setExpandedSection(null);
          }}
        />
        
        {/* Tooltip Content */}
        <div 
          ref={tooltipRef}
          className="relative w-full max-w-4xl bg-gray-800 border-2 border-cyan-500/40 rounded-3xl shadow-2xl animate-in slide-in-from-top duration-300 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header z przełącznikiem języka */}
          <div className="bg-gray-800 border-b border-cyan-500/30 p-8 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {t.completeGuide}
                </h3>
                <p className="text-gray-400 text-lg">
                  {expandedSection 
                    ? helpSections.find(s => s.id === expandedSection)?.title
                    : t.selectSection
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Language Toggle Switch - TYLKO W INSTRUKCJI */}
                <div className="flex items-center gap-2 bg-gray-700/50 rounded-xl p-1 border border-gray-600/50">
                  <button
                    onClick={() => setLanguage('pl')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      language === 'pl' 
                        ? 'bg-cyan-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    PL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      language === 'en' 
                        ? 'bg-cyan-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowTooltip(false);
                    setExpandedSection(null);
                  }}
                  className="text-gray-400 hover:text-white text-2xl transition-all hover:scale-110 p-3 hover:bg-gray-700/50 rounded-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {expandedSection ? (
              // WIDOK SZCZEGÓŁÓW SEKCJI
              <div className="p-8">
                <button
                  onClick={() => setExpandedSection(null)}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-all hover:scale-105"
                >
                  <span className="text-xl">←</span>
                  <span>{t.backToList}</span>
                </button>
                
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl">
                      {helpSections.find(s => s.id === expandedSection)?.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-cyan-400">
                        {helpSections.find(s => s.id === expandedSection)?.title}
                      </h4>
                      <p className="text-gray-400">
                        {t.section} {expandedSection} {t.of} {helpSections.length}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-300 text-lg leading-relaxed space-y-4">
                    {helpSections.find(s => s.id === expandedSection)?.content.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className="flex items-start gap-3">
                        <span className="text-cyan-400 text-xl mt-1">•</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={() => {
                        const currentIndex = helpSections.findIndex(s => s.id === expandedSection);
                        if (currentIndex > 0) {
                          setExpandedSection(helpSections[currentIndex - 1].id);
                        }
                      }}
                      disabled={expandedSection === helpSections[0].id}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t.previous}
                    </button>
                    
                    <button
                      onClick={() => {
                        const currentIndex = helpSections.findIndex(s => s.id === expandedSection);
                        if (currentIndex < helpSections.length - 1) {
                          setExpandedSection(helpSections[currentIndex + 1].id);
                        }
                      }}
                      disabled={expandedSection === helpSections[helpSections.length - 1].id}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // WIDOK LISTY SEKCJI
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {helpSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setExpandedSection(section.id)}
                      className="bg-gray-700/60 border border-gray-600/50 rounded-2xl p-6 transition-all hover:border-cyan-500/50 hover:bg-gray-700/80 hover:transform hover:scale-[1.02] text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {section.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                              {section.id}
                            </span>
                            <h4 className="text-cyan-400 font-semibold text-lg">
                              {section.title}
                            </h4>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {language === 'pl' ? 'Kliknij aby poznać szczegóły...' : 'Click to learn more...'}
                          </p>
                        </div>
                        <div className="text-gray-400 group-hover:text-cyan-400 transition-colors">
                          <span className="text-xl">→</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Quick Start Tips */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl">
                  <div className="text-center">
                    <p className="text-purple-400 text-xl font-semibold mb-4">{t.quickStart}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                      {t.quickStartTips.map((tip, index) => (
                        <div key={index} className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
                          <div className="text-2xl mb-2">{tip.icon}</div>
                          <p className="font-semibold text-cyan-400">{tip.title}</p>
                          <p className="text-sm mt-2">{tip.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center border-t border-gray-700/50 pt-6">
                  <p className="text-gray-400 text-lg">
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
      {/* Help Trigger Button - ZAWSZE PO ANGIELSKU, MNIEJSZY */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
      >
        <span className="text-sm">❓</span>
        <span>Quick Guide</span>
      </button>

      {/* Tooltip Content via Portal */}
      <TooltipContent />
    </>
  );
};

export default HelpTooltip;