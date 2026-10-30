// Global Web Audio Context to handle browser autoplay policies (Same as SoloHearts)
let globalAudioCtx = null;

export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

// Unlock AudioContext and warm up SpeechSynthesis on first user interaction with the window
let cachedVoices = [];
if (typeof window !== 'undefined') {
  const loadVoices = () => {
    if ('speechSynthesis' in window) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
  };
  loadVoices();
  if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  const unlockAudio = () => {
    getAudioContext();
    loadVoices();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

// Clean username so speech engine pronounces it naturally (strips emojis and special symbols)
export const cleanNameForSpeech = (name) => {
  if (!name || typeof name !== 'string') return 'User';
  const cleaned = name
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
      ''
    )
    .replace(/[_]/g, ' ')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'User';
};

// Web Speech API Voice Synthesizer (Configured for Natural Female Voice like SoloHearts)
export const speakNotification = (text) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.15; // Natural, clear female pitch
    utterance.volume = 1.0;
    utterance.lang = 'en-IN';

    // Select best available Female English voice across Chrome, macOS, Windows, Android
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const femalePatterns = [
        /veena/i, // macOS Indian English Female
        /neerja/i, // Microsoft Indian English Female
        /heera/i, // Microsoft Indian English Female
        /swara/i, // Indian English Female
        /aditi/i, // Indian English Female
        /samantha/i, // macOS US Female
        /victoria/i, // macOS US Female
        /karen/i, // Australian Female
        /zira/i, // Windows US Female
        /female/i, // E.g. "Google UK English Female"
        /jenny/i, // Natural Female
        /aria/i, // Natural Female
        /fiona/i, // macOS Female
        /moira/i, // macOS Female
        /tessa/i, // macOS Female
      ];

      // 1. Try Indian English Female voice first (e.g. Veena / Neerja / Heera)
      let femaleVoice = voices.find(
        (v) => (v.lang === 'en-IN' || v.lang.startsWith('en_IN')) && femalePatterns.some((p) => p.test(v.name))
      );

      // 2. Try any English voice matching female name patterns
      if (!femaleVoice) {
        femaleVoice = voices.find((v) => v.lang.startsWith('en') && femalePatterns.some((p) => p.test(v.name)));
      }

      // 3. Fallback to any en-IN voice
      if (!femaleVoice) {
        femaleVoice = voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en_IN'));
      }

      // 4. Fallback to any English voice
      if (!femaleVoice) {
        femaleVoice = voices.find((v) => v.lang.startsWith('en'));
      }

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
};

// Distinct Web Audio chimes for registrations and bookings
export const playNotificationSound = (type = 'default') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    if (type === 'booking') {
      // Triple celebratory coin notes for booking / ride created (C6, E6, G6)
      const freqs = [1046, 1318, 1568];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } else if (type === 'registration') {
      // Upbeat welcoming chime for user/driver/fleet registration (A5 -> E6)
      [880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } else {
      // Standard notification chime
      [880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.12;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    }
  } catch (e) {
    console.error('Audio chime error:', e);
  }
};

// Check if sound is muted by admin
export const isSoundMuted = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_sound_muted') === 'true';
};

// Toggle sound mute state
export const setSoundMuted = (muted) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_sound_muted', muted ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('admin:sound:toggle', { detail: { muted } }));
};

// Announces event with crisp chime followed immediately by natural voice announcement
export const announceEvent = (type, speechText) => {
  if (isSoundMuted()) return;
  playNotificationSound(type);
  if (speechText) {
    setTimeout(() => {
      speakNotification(speechText);
    }, 320);
  }
};

// Expose quick test triggers on window for testing in browser console
if (typeof window !== 'undefined') {
  window.testBookingSound = (name = 'Pavan', vehicle = 'Auto') => {
    announceEvent('booking', `New booking received from ${name}. ${vehicle} requested.`);
  };
  window.testRegistrationSound = (name = 'Pavan', role = 'passenger') => {
    announceEvent('registration', `New ${role} registered: ${name}.`);
  };
}

