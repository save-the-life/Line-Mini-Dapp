import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";
import liff from "@line/liff";
import slLogo from "@/shared/assets/images/sl-logo.png";
import slWatch from "@/shared/assets/images/sl-watch.png";
import giftbox from "@/shared/assets/images/giftbox-icon.png";
import coins from "@/shared/assets/images/coins-icon.png";

// "오늘 하루 그만 보기" 체크 시 그날 날짜(YYYY-MM-DD)를 저장. 그 날짜와 오늘이 같으면 숨김.
const STORAGE_KEY = "thorPromoHideDate";
const THOR_URL = "https://thor.savethelife.io/";
// 백엔드 클릭 집계 엔드포인트 (광고차단 무관). Thor 백엔드가 이 경로로 POST 를 받아 카운트.
// ⚠️ Thor 측 구현 경로와 반드시 일치해야 함.
const THOR_CLICK_ENDPOINT = "https://thor.savethelife.io/api/promo/luckydice-click";
const COUNTDOWN_SECONDS = 5;

// 로컬 기준 오늘 날짜 (YYYY-MM-DD)
const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 기본 노출 ON. VITE_THOR_PROMO_ENABLED 를 "false" 로 명시할 때만 끔(운영 off-switch).
// "오늘 하루 그만 보기" 체크해 둔 날에는 숨김. 다음 날 다시 노출.
const shouldShowInitially = (): boolean => {
  if (import.meta.env.VITE_THOR_PROMO_ENABLED === "false") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== todayStr();
  } catch {
    return true;
  }
};

const hideForToday = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, todayStr());
  } catch {
    // storage quota / private mode — silently ignore
  }
};

export default function ThorPromoModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<boolean>(() => shouldShowInitially());
  const [secondsLeft, setSecondsLeft] = useState<number>(COUNTDOWN_SECONDS);
  const [hideToday, setHideToday] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  const canClose = secondsLeft <= 0;

  // 닫을 때: "오늘 하루 그만 보기" 체크돼 있으면 오늘 날짜 저장(그날 숨김), 아니면 다음 진입에 다시 노출
  const dismiss = () => {
    if (hideToday) hideForToday();
    setOpen(false);
  };

  const handleClose = () => {
    if (!canClose) return;
    dismiss();
  };

  const recordClick = () => {
    // 1) 백엔드 집계 (광고차단 무관, 정확한 클릭 수). sendBeacon 은 새 창 이동에도 전송 보장.
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(THOR_CLICK_ENDPOINT);
      } else {
        fetch(THOR_CLICK_ENDPOINT, { method: "POST", keepalive: true, mode: "no-cors" });
      }
    } catch {
      // 집계 실패가 클릭 동작을 막지 않도록 무시
    }
    // 2) GA4 이벤트 (기기/소스 분해용 보조 지표 — 광고차단 시 누락될 수 있음)
    try {
      (window as any).gtag?.("event", "thor_join_click", {
        source: "luckydice_modal",
      });
    } catch {
      // analytics not available — ignore
    }
  };

  const handleJoinThor = () => {
    dismiss();
    recordClick();
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
            <div className="inline-flex items-center gap-1 text-2xl font-extrabold text-gray-900">
              <img src={slLogo} alt="THOR" className="w-10 h-10 object-cover object-left" />
              <span>THOR</span>
            </div>
          </div>

          <DialogPrimitive.Title asChild>
            <div className="text-center mb-7">
              <div className="text-2xl font-extrabold text-gray-900 leading-tight">
                {t("thor_promo.join_first")}
              </div>
              <div className="text-2xl font-extrabold text-blue-600 leading-tight">
                {t("thor_promo.ambassadors")}
              </div>
            </div>
          </DialogPrimitive.Title>

          <div className="space-y-5 mb-6">
            <Section
              imgSrc={slWatch}
              imgAlt="SL Smart Watch"
              titleBlue={t("thor_promo.watch_title_1")}
              titleBlack={t("thor_promo.watch_title_2")}
              body={t("thor_promo.watch_body")}
            />
            <hr className="border-gray-100" />
            <Section
              imgSrc={giftbox}
              imgAlt="Gift box"
              imgClassName="w-full h-full object-cover"
              titleBlue={t("thor_promo.airdrop_title_1")}
              titleBlack={t("thor_promo.airdrop_title_2")}
              body={t("thor_promo.airdrop_body")}
            />
            <hr className="border-gray-100" />
            <Section
              imgSrc={coins}
              imgAlt="Coins"
              imgClassName="w-full h-full object-cover"
              titleBlue={t("thor_promo.points_title_1")}
              titleBlack={t("thor_promo.points_title_2")}
              body={t("thor_promo.points_body")}
            />
          </div>

          <button
            type="button"
            onClick={handleJoinThor}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold flex items-center justify-center gap-2 transition"
          >
            <span>{t("thor_promo.join_button")}</span>
            <span aria-hidden="true">→</span>
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            {t("thor_promo.footer")}
          </p>

          <label className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideToday}
              onChange={(e) => setHideToday(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            {t("thor_promo.hide_today")}
          </label>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface SectionProps {
  imgSrc: string;
  imgAlt: string;
  imgClassName?: string;
  titleBlue: string;
  titleBlack: string;
  body: string;
}

function Section({ imgSrc, imgAlt, imgClassName, titleBlue, titleBlack, body }: SectionProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc}
          alt={imgAlt}
          className={imgClassName ?? "w-full h-full object-contain p-1.5"}
        />
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
