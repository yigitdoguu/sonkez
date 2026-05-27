import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, ChevronRight, MessageCircle, Heart, Star, Sparkles, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── NTFY.SH CONFIG ─────────────────────────────────────────────────────────
// Set the topic to the one you're viewing in ntfy.sh (e.g. 'birmesaj')
const NTFY_TOPIC = 'birmesaj';

async function sendNtfy(event: string, extra = ''): Promise<boolean> {
  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: `${event}: ${extra}`,
      headers: {
        'Title': 'Bir Hayal Bildirimi',
        'Tags': 'heart,cloud'
      }
    });
    if (!res.ok) {
      console.error('ntfy failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('ntfy error', err);
    return false;
  }
}

// ─── ATMOSPHERIC COMPONENTS ──────────────────────────────────────────────────
const Rain = () => {
  const drops = Array.from({ length: 80 });
  return (
    <div className="rain">
      {drops.map((_, i) => (
        <div
          key={i}
          className="drop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            '--duration': `${0.6 + Math.random() * 0.4}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const Lightning = () => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const trigger = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      
      const next = 5000 + Math.random() * 10000;
      setTimeout(trigger, next);
    };
    
    const initial = setTimeout(trigger, 3000);
    return () => clearTimeout(initial);
  }, []);

  return <div className={`lightning-flash ${flash ? 'flash-anim' : ''}`} />;
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MEMORY_CARDS = [
  {
    title: 'O gün',
    text: 'Mehmet Akifdeyken hatırlıyor musun? Hatta okulun sonlarına doğru ben arabadaydım sen bana imalı bir bakış atmıştın.',
    icon: <Sparkles className="text-blue-300" size={32} />,
  },
  {
    title: 'Fetret Devri',
    text: 'Hani ben sana açıldığımda sen benle aylarca konuşmamıştın? Çok zaman geçmeden de hani bir çocuk vardı ona söylemiştin benden hoşlanmadığını. O çocuk da bana söylemişti. O zaman bir ok saplandı bana. Zehirliydi bu ok ve asla çıkmadı',
    icon: <Moon className="text-blue-300" size={32} />,
  },
  {
    title: 'Peki artık?',
    text: 'O oklar hala kalbimde paslandı ama zehrini hala yayıyor ve kalbimi günden güne bitiriyor. Peki? Peki o okları kim çıkarıcak? Bırakılan bu düşü kim büyütecek? Hatırla ipek bana notlaştığımızda bana biraz zaman ver diye bir not yazmıştın. Daha ne kadar zaman vermeliyim?',
    icon: <Star className="text-blue-300" size={32} />,
  },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState<'intro' | 'countdown' | 'memories' | 'final' | 'success' | 'rejected'>('intro');
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [countdownMessage, setCountdownMessage] = useState(0);
  const noRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const thunderRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    sendNtfy('SİTE AÇILDI', 'Ziyaretçi yağmurlu anılara giriş yaptı.');
  }, []);

  const handleNextMemory = () => {
    if (memoryIndex < MEMORY_CARDS.length - 1) {
      setMemoryIndex(memoryIndex + 1);
    } else {
      setStep('final');
    }
  };

  const handleYes = async () => {
    setStep('success');
    await sendNtfy('EVET DEDİ! 💖', 'Whatsapptan mutlu edilmek istiyor.');
    
    // Müzik çal
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.log('Müzik çalınamadı:', err));
        }
      }
    }, 200);
    
    // Havai fişekler - pembe renkler
    confetti({
      particleCount: 300,
      spread: 180,
      origin: { y: 0.5 },
      colors: ['#ff1493', '#ff69b4', '#ff0000', '#ff69b4', '#ff1493']
    });
    
    // İkinci wave
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 180,
        origin: { x: 0, y: 0 },
        colors: ['#ff1493', '#ff69b4', '#ff0000']
      });
    }, 200);
  };

  

  const handleNo = async () => {
    setStep('rejected');
    // send ntfy
    await sendNtfy('HAYIR DEDİ 💔', 'Maalesef reddetti.');
    // Try to play thunder sound (loud). If audio file missing or fails, fallback to WebAudio 'boom'.
    let played = false;
    if (thunderRef.current) {
      try {
        thunderRef.current.currentTime = 0;
        thunderRef.current.volume = 1;
        const p = thunderRef.current.play();
        if (p !== undefined) {
          await p.catch(() => { played = false; });
          played = true;
        } else {
          played = true;
        }
      } catch (e) {
        played = false;
      }
    }

    if (!played) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const bufferSize = ctx.sampleRate * 1.2; // 1.2s noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        // fill with random noise and envelope for a low boom
        for (let i = 0; i < bufferSize; i++) {
          // decaying noise
          const decay = 1 - i / bufferSize;
          data[i] = (Math.random() * 2 - 1) * decay * 0.8;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 400;
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        // ramp up quickly then decay
        gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        src.connect(lp).connect(gain).connect(ctx.destination);
        src.start();
      } catch (err) {
        console.error('thunder fallback failed', err);
      }
    }
  };

  const startCountdown = () => {
    setStep('countdown');
    setCountdownMessage(0);
    
    const messages = ['Gerçekten', 'Hatırlıyor musun?', 'Eski günlerden bahsediyorum', '...'];
    
    const intervals = messages.map((_, i) => {
      return setTimeout(() => {
        setCountdownMessage(i + 1);
        if (i === messages.length - 1) {
          setTimeout(() => {
            setMemoryIndex(0);
            setStep('memories');
          }, 1200);
        }
      }, (i + 1) * 1500);
    });
    
    return () => intervals.forEach(clearTimeout);
  };

  

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 select-none overflow-hidden">
      <audio ref={audioRef} src="/music/music.mp3.mp3" loop />
      <div className="bg-overlay" />
      {step !== 'success' && step !== 'rejected' && <Rain />}
      {step !== 'success' && step !== 'rejected' && <Lightning />}
      <audio ref={thunderRef} src="/music/thunder.mp3" />

      <AnimatePresence mode="wait">
        {/* ── INTRO ─────────────────────────────────────────────────────────── */}
        {step === 'intro' && (
          <motion.div key="intro" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="glass-card z-10 w-full max-w-sm p-10 text-center space-y-8"
          >
            <div className="space-y-4">
              <CloudRain size={48} className="mx-auto text-blue-300 opacity-50" />
              <h1 className="text-3xl font-display font-medium text-white tracking-tight">
                Anılarımı hatırlayalım mı biraz?
              </h1>
              <p className="text-sm text-white/40 font-body italic">
                Bugün hava biraz kasvetli, tıpkı içimdeki bazı anlar gibi...
              </p>
            </div>
            <button
              onClick={startCountdown}
              className="btn-primary w-full py-4 font-display text-lg"
            >
              Hatırlayalım...
            </button>
          </motion.div>
        )}

        {/* ── COUNTDOWN ──────────────────────────────────────────────────────── */}
        {step === 'countdown' && (
          <motion.div key="countdown" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="z-10 w-full max-w-2xl text-center min-h-[300px] flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {countdownMessage > 0 && (
                <motion.div
                  key={`msg-${countdownMessage}`}
                  initial={{ opacity: 0, scale: 0.5, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: -30 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <h1 className="text-5xl font-display font-medium text-white tracking-tight">
                    {countdownMessage === 1 && 'Gerçekten'}
                    {countdownMessage === 2 && 'Hatırlıyor musun?'}
                    {countdownMessage === 3 && 'Eski günlerden bahsediyorum'}
                    {countdownMessage === 4 && '...'}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── MEMORIES ─────────────────────────────────────────────────────── */}
        {step === 'memories' && (
          <motion.div key={`memory-${memoryIndex}`} variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="glass-card z-10 w-full max-w-sm p-10 space-y-8 text-center min-h-[400px] flex flex-col justify-between"
          >
            <motion.div
              key={`memory-content-${memoryIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                {MEMORY_CARDS[memoryIndex].icon}
              </div>
              <h2 className="text-2xl font-display font-medium text-white">
                {MEMORY_CARDS[memoryIndex].title}
              </h2>
              <p className="text-white/60 font-body text-base leading-relaxed italic">
                "{MEMORY_CARDS[memoryIndex].text}"
              </p>
            </motion.div>
            
            <div className="flex items-center justify-between pt-6">
              <div className="flex gap-2">
                {MEMORY_CARDS.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === memoryIndex ? 'w-8 bg-white/60' : 'w-2 bg-white/10'}`} />
                ))}
              </div>
              <button
                onClick={handleNextMemory}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── FINAL ────────────────────────────────────────────────────────── */}
        {step === 'final' && (
          <motion.div key="final" variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="glass-card z-10 w-full max-w-sm p-10 text-center space-y-10"
          >
            <div className="space-y-4">
              <Heart size={40} className="mx-auto text-white/20" />
              <h2 className="text-2xl font-display font-medium text-white leading-tight">
                Seninle yeni anılar üretmek istiyorum...
              </h2>
              <p className="text-white/50 font-body text-base">
                Seni yeniden mutlu etmek, Whatsapp'tan o eski günlerdeki gibi gülümsetmek istiyorum.
              </p>
            </div>

            <div className="space-y-4 relative">
              <button
                onClick={handleYes}
                className="btn-accent w-full py-4 text-lg"
              >
                Evet, isterim ❤️
              </button>
              
              <div className="h-12 flex items-center justify-center">
                <button
                  ref={noRef}
                  onClick={handleNo}
                  className="text-white/20 text-sm italic"
                >
                  Belki sonra...
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS ──────────────────────────────────────────────────────── */}
        {step === 'success' && (
          <>
            {/* Pembe Flash Arka Plan */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-pink-400 z-20 pointer-events-none"
            />
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              className="glass-card z-30 w-full max-w-sm p-10 text-center space-y-6 relative"
            >
            <MessageCircle size={60} className="mx-auto text-white opacity-80" />
            <h2 className="text-3xl font-display font-medium text-white">
              Yolun başındayız...
            </h2>
            <p className="text-white/60 font-body italic">
              Mesajını aldım. Bildirim bana geldi. Yazar mısın whatsapp'dan duygularını?
            </p>
            </motion.div>
          </>
        )}

        {/* ── REJECTED / NO ───────────────────────────────────────────────────── */}
        {step === 'rejected' && (
          <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center bg-pink-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="absolute inset-0 bg-white/90 animate-pulse" />
            <div className="relative z-50 max-w-md p-8 text-center bg-transparent">
              <h1 className="text-4xl font-display text-black">Yanıtın Onaylanmıştır</h1>
              <p className="mt-4 text-black/70">(Hayatında başarılar.)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="fixed bottom-8 opacity-10 pointer-events-none">
          <p className="text-[10px] tracking-widest uppercase font-display">Bir Hayal...</p>
        </div>

      
    </div>
  );
}