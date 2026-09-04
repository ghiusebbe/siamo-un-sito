"use client";

import { useEffect, useState } from "react";

type FundingChoices = {
  callbackQueue?: Array<Record<string, () => void>>;
  showRevocationMessage?: () => void;
};

declare global {
  interface Window {
    googlefc?: FundingChoices;
  }
}

/**
 * Withdrawing consent has to be as easy as giving it. The consent message is
 * part of Google's Funding Choices, which Google Publisher Tag loads only on
 * pages carrying a configured ad slot, so the control appears once the CMP
 * announces itself and stays out of the way everywhere else.
 */
export function ConsentLink() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    window.googlefc ??= {};
    window.googlefc.callbackQueue ??= [];
    window.googlefc.callbackQueue.push({
      CONSENT_DATA_READY: () => setAvailable(typeof window.googlefc?.showRevocationMessage === "function"),
    });
  }, []);

  if (!available) return null;

  return (
    <button className="footer-consent" onClick={() => window.googlefc?.showRevocationMessage?.()} type="button">
      Gestisci il consenso
    </button>
  );
}
