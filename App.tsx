import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, ChevronRight, MessageCircle, Heart, Star, Sparkles, Moon } from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── NTFY.SH CONFIG ─────────────────────────────────────────────────────────
const NTFY_TOPIC = 'birhayal_ozel'; // Kendi ntfy kanalını buraya yazabilirsin

async function sendNtfy(event: string, extra = '') {
  try {
    await fetch(`https://ntfy.sh/birmesaj`, {
      method: 'POST',
      body: `${event}: ${extra}`,
      headers: {
        'Title': 'Bir Hayal Bildirimi',
        'Tags': 'heart,cloud'
      }
    });
  } catch {
    // sessiz hata
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
    title: 'İlk Karşılaşma',
    text: 'Seni ilk gördüğüm anı hatırlıyor musun? Sanki dünya bir anlığına durmuştu. O günden beri zihnimde hep o an var.',
    icon: <Sparkles className="text-blue-300" size={32} />,
  },
  {
    title: 'Sessiz Bakışmalar',
    text: 'Konuşmadan anlaştığımız o anlar... Gözlerindeki o derinliği keşfetmek benim için en büyük hazineydi.',
    icon: <Moon className="text-blue-300" size={32} />,
  },
  {
    title: 'Paylaşılan Anlar',
    text: 'Bazen sadece yan yana oturmak bile yetti. Kalbimdeki bu ağırlığın sebebi, o güzel anların özlemi belki de.',
    icon: <Star className="text-blue-300" size={32} />,
  },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState<'intro' | 'memories' | 'final' | 'success'>('intro');
  const [memoryIndex, setMemoryIndex] = useState(0);
  const noRef = useRef<HTMLButtonElement>(null);

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
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#4a5568', '#a0aec0']
    });
  };

  const handleNo = async () => {
    await sendNtfy('HAYIR DEDİ 💔', 'Maalesef reddetti.');
  };

  

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 select-none overflow-hidden">
      <div className="bg-overlay" />
      <Rain />
      <Lightning />

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
              onClick={() => setStep('memories')}
              className="btn-primary w-full py-4 font-display text-lg"
            >
              Hatırlayalım...
            </button>
          </motion.div>
        )}

        {/* ── MEMORIES ─────────────────────────────────────────────────────── */}
        {step === 'memories' && (
          <motion.div key={`memory-${memoryIndex}`} variants={pageVariants} initial="initial" animate="animate" exit="exit"
            className="glass-card z-10 w-full max-w-sm p-10 space-y-8 text-center min-h-[400px] flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
                {MEMORY_CARDS[memoryIndex].icon}
              </div>
              <h2 className="text-2xl font-display font-medium text-white">
                {MEMORY_CARDS[memoryIndex].title}
              </h2>
              <p className="text-white/60 font-body text-base leading-relaxed italic">
                "{MEMORY_CARDS[memoryIndex].text}"
              </p>
            </div>
            
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
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card z-10 w-full max-w-sm p-10 text-center space-y-6"
          >
            <MessageCircle size={60} className="mx-auto text-white opacity-80" />
            <h2 className="text-3xl font-display font-medium text-white">
              Yolun başındayız...
            </h2>
            <p className="text-white/60 font-body italic">
              Mesajını aldım. En kısa sürede yanında olacağım. Seni bekliyorum...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 opacity-10 pointer-events-none">
        <p className="text-[10px] tracking-widest uppercase font-display">Bir Hayal...</p>
      </div>
    </div>
  );
}
