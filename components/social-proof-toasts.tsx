'use client';

import { useState, useEffect } from 'react';

type Tier = 'basic' | 'protected' | 'nonsnack';
type NotificationType = 'purchase' | 'review';

interface Toast {
  id: string;
  message: string;
  tier: Tier;
  type: NotificationType;
}

interface SocialProofToastsProps {
  locale?: 'en' | 'es';
}

const EN_PURCHASES = [
  { message: 'Tomáš from Prague just became a Protected Friend', tier: 'protected' as const },
  { message: 'Sarah from Sydney chose Non-Snack Recognition', tier: 'nonsnack' as const },
  { message: 'Carlos from Barcelona joined the Alliance', tier: 'basic' as const },
  { message: 'Yuki from Tokyo upgraded to Protected Friend', tier: 'protected' as const },
  { message: 'Emma from London got a certificate for her boyfriend', tier: 'protected' as const },
  { message: 'Beach Bar Malibu just became a Shark-Approved Zone', tier: 'basic' as const },
  { message: 'Dive Center Cozumel received business certification', tier: 'basic' as const },
  { message: 'Marco from Rome gifted Protected Friend Status', tier: 'protected' as const },
];

const EN_REVIEWS = [
  { message: '★★★★★ "Bought Non-Snack status. Met a shark yesterday — it just winked at me. 10/10."', tier: 'nonsnack' as const },
  { message: '★★★★★ "Gifted this to my dad who\'s terrified of sharks. Best $19 I ever spent."', tier: 'protected' as const },
  { message: '★★★★★ "My surf school is now officially Shark-Approved. Bookings up 200% (symbolically)."', tier: 'basic' as const },
  { message: '★★★★★ "The certificate looks so real my mom thought I joined the navy."', tier: 'basic' as const },
  { message: '★★★★★ "Finally, a diplomatic solution to the shark problem. About time."', tier: 'protected' as const },
];

const ES_PURCHASES = [
  { message: 'Tomáš de Praga se convirtió en Amigo Protegido', tier: 'protected' as const },
  { message: 'Sarah de Sídney eligió Reconocimiento Sin Snacks', tier: 'nonsnack' as const },
  { message: 'Carlos de Barcelona se unió a la Alianza', tier: 'basic' as const },
  { message: 'Yuki de Tokio se actualizó a Amigo Protegido', tier: 'protected' as const },
  { message: 'Emma de Londres recibió un certificado para su novio', tier: 'protected' as const },
  { message: 'Beach Bar Malibu se convirtió en Zona Aprobada por Tiburones', tier: 'basic' as const },
  { message: 'Centro de Buceo Cozumel recibió certificación comercial', tier: 'basic' as const },
  { message: 'Marco de Roma regaló Estado de Amigo Protegido', tier: 'protected' as const },
];

const ES_REVIEWS = [
  { message: '★★★★★ "Compré estado Sin Snacks. Conocí un tiburón ayer — ¡me guiñó un ojo! 10/10."', tier: 'nonsnack' as const },
  { message: '★★★★★ "Se lo regalé a mi papá que le tienen miedo a los tiburones. Mejor dinero gastado."', tier: 'protected' as const },
  { message: '★★★★★ "Mi escuela de surf es oficialmente Aprobada por Tiburones. Reservas +200%."', tier: 'basic' as const },
  { message: '★★★★★ "El certificado se ve tan real que mi mamá pensó que me uní a la armada."', tier: 'basic' as const },
  { message: '★★★★★ "Finalmente, una solución diplomática al problema de los tiburones. Era hora."', tier: 'protected' as const },
];

const getTierEmoji = (tier: Tier): string => {
  switch (tier) {
    case 'basic':
      return '🐟';
    case 'protected':
      return '🛡️';
    case 'nonsnack':
      return '🚫🍽️';
  }
};

const TickerBar = ({ locale = 'en' }: { locale: 'en' | 'es' }) => {
  const purchases = locale === 'en' ? EN_PURCHASES : ES_PURCHASES;
  const reviews = locale === 'en' ? EN_REVIEWS : ES_REVIEWS;
  const allItems = [...purchases, ...reviews];
  const extendedItems = [...allItems, ...allItems]; // Repeat for seamless scroll

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200 py-3">
      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .ticker-container {
          animation: ticker-scroll 30s linear infinite;
        }
        .ticker-container:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="ticker-container flex gap-8 whitespace-nowrap px-4">
        {extendedItems.map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 text-sm text-blue-700 font-medium">
            <span>{getTierEmoji(item.tier)}</span>
            <span className="text-ellipsis">{item.message.substring(0, 50)}...</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const Toast = ({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(-100%) translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        @keyframes toast-fade-out {
          from {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%) translateY(100%);
          }
        }
        .toast-enter {
          animation: toast-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .toast-exit {
          animation: toast-fade-out 0.3s ease-in;
        }
      `}</style>
      <div
        className="toast-enter fixed bottom-6 left-6 max-w-sm"
        onAnimationEnd={() => {
          if (document.querySelector(`[data-toast-id="${toast.id}"]`)?.classList.contains('toast-exit')) {
            onDismiss(toast.id);
          }
        }}
        data-toast-id={toast.id}
      >
        <div className="bg-white rounded-lg shadow-lg backdrop-blur-sm bg-opacity-95 p-4 border border-blue-100 flex items-start gap-3 group hover:shadow-xl transition-shadow">
          {/* Emoji/Tier Icon */}
          <div className="text-2xl flex-shrink-0 mt-0.5">
            {getTierEmoji(toast.tier)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 leading-relaxed break-words">
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              const el = document.querySelector(`[data-toast-id="${toast.id}"]`);
              if (el) {
                el.classList.add('toast-exit');
              }
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export function SocialProofToasts({ locale = 'en' }: SocialProofToastsProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const purchases = locale === 'en' ? EN_PURCHASES : ES_PURCHASES;
    const reviews = locale === 'en' ? EN_REVIEWS : ES_REVIEWS;
    const allNotifications = [...purchases.map(p => ({ ...p, type: 'purchase' as const })), ...reviews.map(r => ({ ...r, type: 'review' as const }))];

    let index = 0;

    const showNext = () => {
      const notification = allNotifications[index % allNotifications.length];
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((prev) => [...prev.slice(-2), { id, message: notification.message, tier: notification.tier, type: notification.type }]);
      index++;
    };

    const interval = setInterval(showNext, 6000);

    return () => clearInterval(interval);
  }, [locale]);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {/* Ticker Bar at Top */}
      <TickerBar locale={locale} />

      {/* Toast Notifications */}
      <div className="fixed bottom-0 left-0 pointer-events-none z-40">
        <div className="pointer-events-auto">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
          ))}
        </div>
      </div>
    </>
  );
}
