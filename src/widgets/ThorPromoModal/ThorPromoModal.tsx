import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import liff from "@line/liff";
import slLogo from "@/shared/assets/images/sl-logo.png";
import slWatch from "@/shared/assets/images/sl-watch.png";
import giftbox from "@/shared/assets/images/giftbox-icon.png";
import coins from "@/shared/assets/images/coins-icon.png";

const STORAGE_KEY = "thorAmbassadorModalShown";
const THOR_URL = "https://thor.savethelife.io/";
const COUNTDOWN_SECONDS = 5;

// 기본 노출 ON. VITE_THOR_PROMO_ENABLED 를 "false" 로 명시할 때만 끔(운영 off-switch).
const shouldShowInitially = (): boolean => {
  if (import.meta.env.VITE_THOR_PROMO_ENABLED === "false") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
};

const markAsShown = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // storage quota / private mode — silently ignore
  }
};

export default function ThorPromoModal() {
  const [open, setOpen] = useState<boolean>(() => shouldShowInitially());
  const [secondsLeft, setSecondsLeft] = useState<number>(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) return;
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  const canClose = secondsLeft <= 0;

  const handleClose = () => {
    if (!canClose) return;
    markAsShown();
    setOpen(false);
  };

  const handleJoinThor = () => {
    markAsShown();
    setOpen(false);
    try {
      if (liff.isInClient?.()) {
        liff.openWindow({ url: THOR_URL, external: true });
        return;
      }
    } catch {
      // liff not initialized — fall through to window.open
    }
    window.open(THOR_URL, "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={!canClose}
            aria-label={canClose ? "Close" : `Wait ${secondsLeft}s`}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold transition ${
              canClose
                ? "text-gray-600 hover:bg-gray-100 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {canClose ? "✕" : secondsLeft}
          </button>

          <div className="text-center mb-3 mt-2">
            <div className="inline-flex items-center gap-1.5 text-2xl font-extrabold text-gray-900">
              <img src={slLogo} alt="THOR" className="w-8 h-8 object-contain" />
              <span>THOR</span>
            </div>
          </div>

          <DialogPrimitive.Title asChild>
            <div className="text-center mb-7">
              <div className="text-2xl font-extrabold text-gray-900 leading-tight">
                JOIN THE FIRST
              </div>
              <div className="text-2xl font-extrabold text-blue-600 leading-tight">
                SL AMBASSADORS
              </div>
            </div>
          </DialogPrimitive.Title>

          <div className="space-y-5 mb-6">
            <Section
              imgSrc={slWatch}
              imgAlt="SL Smart Watch"
              titleBlue="1,000 TOP AMBASSADORS"
              titleBlack="RECEIVE AN SL SMART WATCH"
              body="Top 1,000 outstanding users will receive an SL Smart Watch."
            />
            <hr className="border-gray-100" />
            <Section
              imgSrc={giftbox}
              imgAlt="Gift box"
              titleBlue="ONGOING"
              titleBlack="AIRDROP EVENTS"
              body="Join regular campaigns and special airdrop events."
            />
            <hr className="border-gray-100" />
            <Section
              imgSrc={coins}
              imgAlt="Coins"
              titleBlue="EARN POINTS,"
              titleBlack="UNLOCK FUTURE BENEFITS"
              body="Earn points by completing missions and growing the community. Points can be used for future SL ecosystem benefits."
            />
          </div>

          <button
            type="button"
            onClick={handleJoinThor}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold flex items-center justify-center gap-2 transition"
          >
            <span>JOIN THOR</span>
            <span aria-hidden="true">→</span>
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Start your ambassador journey today.
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface SectionProps {
  imgSrc: string;
  imgAlt: string;
  titleBlue: string;
  titleBlack: string;
  body: string;
}

function Section({ imgSrc, imgAlt, titleBlue, titleBlack, body }: SectionProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
        <img src={imgSrc} alt={imgAlt} className="w-12 h-12 object-contain" />
      </div>
      <div className="flex-1 min-w-0 pt-1">
        <div className="text-sm font-bold text-blue-600 leading-tight">
          {titleBlue}
        </div>
        <div className="text-base font-extrabold text-gray-900 leading-tight mb-1">
          {titleBlack}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
