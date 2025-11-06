// src/utils/translations.js
export const translations = {
  pl: {
    // Nagłówki i przyciski
    quickGuide: "Przewodnik",
    completeGuide: "Kompletny Przewodnik HUB Portal",
    selectSection: "Wybierz sekcję aby poznać szczegóły",
    backToList: "← Powrót do listy sekcji",
    previous: "← Poprzednia",
    next: "Następna →",
    section: "Sekcja",
    of: "z",
    quickStart: "🎯 Szybki Start",
    
    // Sekcje instrukcji
    sections: [
      {
        id: 1,
        title: "💰 System Tokenów HC",
        icon: "💎",
        content: `• Otrzymujesz 1 token HC za każdą wiadomość w czacie publicznym
• Dzienne limit: 10 tokenów HC na użytkownika
• Tokeny są automatycznie przesyłane do Twojego portfela Celo
• Sprawdź swój stan konta w prawym górnym rogu ekranu
• Tokeny HC są prawdziwymi tokenami na blockchainie Celo`
      },
      {
        id: 2,
        title: "💬 Czat Publiczny",
        icon: "💬", 
        content: `• To główny kanał komunikacji ze wszystkimi użytkownikami
• Pisz wiadomości i zdobywaj HC tokeny za aktywność
• Każda wiadomość = +1 HC (do limitu 10 dziennie)
• Używaj Enter do szybkiego wysyłania wiadomości
• Wiadomości są widoczne dla wszystkich w czasie rzeczywistym`
      },
      {
        id: 3,
        title: "🔒 Czaty Prywatne",
        icon: "🔒",
        content: `• Rozmawiaj prywatnie 1-na-1 z dowolnym użytkownikiem
• Pierwsza wiadomość w nowym czacie kosztuje 1 HC (zabezpieczenie antyspamowe)
• Kolejne wiadomości w tym samym czacie są darmowe
• Kliknij na dowolnego użytkownika w liście aby rozpocząć czat prywatny
• Zielona kropka oznacza, że użytkownik jest aktualnie online`
      },
      {
        id: 4,
        title: "👥 Zarządzanie Kontaktami",
        icon: "👥",
        content: `• 🟢 Zakładka "Online" - użytkownicy aktywni w ciągu ostatnich 10 minut
• 👥 Zakładka "All Users" - wszyscy zarejestrowani użytkownicy aplikacji
• Status online: zielona kropka przy awatarze użytkownika
• Nieprzeczytane wiadomości: czerwony licznik powiadomień
• Kliknij na użytkownika aby otworzyć czat prywatny`
      },
      {
        id: 5,
        title: "🎯 System Reakcji",
        icon: "😊",
        content: `• Najedź kursorem na dowolną wiadomość aby zobaczyć opcję "React"
• Kliknij "React" aby wyświetlić panel z emotikonami
• Wybierz emotikonę aby dodać reakcję do wiadomości
• Reakcje są widoczne dla wszystkich użytkowników
• Kliknij ponownie na reakcję aby ją usunąć
• Reakcje są zapisywane na stałe w systemie`
      },
      {
        id: 6,
        title: "🚀 Rozpocznij Podróż",
        icon: "🚀",
        content: `• Krok 1: Połącz swój portfel Celo (RainbowKit)
• Krok 2: Ustaw unikalny nick i wybierz avatar (nieedytowalne później!)
• Krok 3: Dołącz do konwersacji w czacie publicznym aby zdobyć pierwsze HC
• Krok 4: Eksploruj listę użytkowników i nawiązuj prywatne konwersacje
• Krok 5: Używaj reakcji aby wyrażać emocje wobec wiadomości
• Krok 6: Śledź swoje zarobki HC w panelu statystyk`
      },
      {
        id: 7,
        title: "📊 Statystyki",
        icon: "📊",
        content: `• 💎 HC: Aktualna ilość tokenów HC w Twoim portfelu
• 🎯 Left: Pozostała liczba tokenów do zdobycia dzisiaj (z 10)
• 📩 Licznik nieprzeczytanych wiadomości prywatnych
• Ikona online/offline przy każdym użytkowniku
• Czas ostatniej aktywności użytkowników`
      }
    ],

    // Quick start tips
    quickStartTips: [
      {
        icon: "💬",
        title: "Napisz Wiadomość",
        description: "Zacznij od czatu publicznego"
      },
      {
        icon: "🔗", 
        title: "Połącz Portfel",
        description: "Upewnij się że jest podłączony"
      },
      {
        icon: "😊",
        title: "Dodaj Reakcje",
        description: "Interaguj z innymi"
      }
    ],

    // Footer
    readyToStart: "Gotowy do rozpoczęcia przygody w HUB Portal?",
    closeAndJoin: "Zamknij przewodnik i dołącz do społeczności!"
  },

  en: {
    // Headers and buttons
    quickGuide: "Quick Guide",
    completeGuide: "Complete HUB Portal Guide",
    selectSection: "Select a section to learn more",
    backToList: "← Back to sections list",
    previous: "← Previous",
    next: "Next →",
    section: "Section",
    of: "of",
    quickStart: "🎯 Quick Start",
    
    // Instruction sections
    sections: [
      {
        id: 1,
        title: "💰 HC Token System",
        icon: "💎",
        content: `• Earn 1 HC token for every public chat message
• Daily limit: 10 HC tokens per user
• Tokens are automatically sent to your Celo wallet
• Check your balance in the top right corner of the screen
• HC tokens are real tokens on the Celo blockchain`
      },
      {
        id: 2,
        title: "💬 Public Chat",
        icon: "💬", 
        content: `• Main communication channel with all users
• Write messages and earn HC tokens for activity
• Each message = +1 HC (up to 10 daily limit)
• Use Enter for quick message sending
• Messages are visible to everyone in real-time`
      },
      {
        id: 3,
        title: "🔒 Private Chats",
        icon: "🔒",
        content: `• Chat privately 1-on-1 with any user
• First message in a new chat costs 1 HC (anti-spam protection)
• Subsequent messages in the same chat are free
• Click on any user in the list to start a private chat
• Green dot indicates the user is currently online`
      },
      {
        id: 4,
        title: "👥 Contact Management",
        icon: "👥",
        content: `• 🟢 "Online" tab - users active within last 10 minutes
• 👥 "All Users" tab - all registered application users
• Online status: green dot next to user's avatar
• Unread messages: red notification counter
• Click on user to open private chat`
      },
      {
        id: 5,
        title: "🎯 Reaction System",
        icon: "😊",
        content: `• Hover over any message to see the "React" option
• Click "React" to display the emoji panel
• Select an emoji to add reaction to the message
• Reactions are visible to all users
• Click again on reaction to remove it
• Reactions are permanently saved in the system`
      },
      {
        id: 6,
        title: "🚀 Start Your Journey",
        icon: "🚀",
        content: `• Step 1: Connect your Celo wallet (RainbowKit)
• Step 2: Set unique nickname and choose avatar (cannot be changed later!)
• Step 3: Join the conversation in public chat to earn first HC
• Step 4: Explore user list and start private conversations
• Step 5: Use reactions to express emotions towards messages
• Step 6: Track your HC earnings in statistics panel`
      },
      {
        id: 7,
        title: "📊 Statistics",
        icon: "📊",
        content: `• 💎 HC: Current amount of HC tokens in your wallet
• 🎯 Left: Remaining tokens to earn today (out of 10)
• 📩 Unread private messages counter
• Online/offline icon for each user
• Last activity time of users`
      }
    ],

    // Quick start tips
    quickStartTips: [
      {
        icon: "💬",
        title: "Write Message",
        description: "Start with public chat"
      },
      {
        icon: "🔗", 
        title: "Connect Wallet",
        description: "Make sure it's connected"
      },
      {
        icon: "😊",
        title: "Add Reactions",
        description: "Interact with others"
      }
    ],

    // Footer
    readyToStart: "Ready to start your HUB Portal adventure?",
    closeAndJoin: "Close guide and join the community!"
  }
};

// Funkcja do wykrywania języka przeglądarki
export const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('pl') ? 'pl' : 'en';
};

// Hook do zarządzania językiem
export const useLanguage = () => {
  const [language, setLanguage] = useState(getBrowserLanguage());

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pl' ? 'en' : 'pl');
  };

  return { language, toggleLanguage };
};