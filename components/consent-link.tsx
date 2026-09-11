"use client";

import { useEffect, useState } from "react";

type FundingChoices = {
  callbackQueue?: Array<Record<string, () => void>>;
  showRevocationMessage?: () => void;
  getConsentStatus?: () => number;
  ConsentStatusEnum?: { UNKNOWN: number; CONSENT_NOT_REQUIRED: number };
};

declare global {
  interface Window {
    googlefc?: FundingChoices;
  }
}

/**
 * Funding Choices ships with the AdSense tag on every page, and it exposes
 * `showRevocationMessage` even where the consent message never ran, so that
 * function alone is not evidence of a choice to reopen. Ask the CMP what it
 * recorded instead: no recorded choice means the button would do nothing.
 */
function revocable(consent: FundingChoices | undefined) {
  if (typeof consent?.showRevocationMessage !== "function") return false;

  const status = consent.getConsentStatus?.();
  const statuses = consent.ConsentStatusEnum;
  // Withdrawing has to stay as easy as consenting, so an unreadable status
  // keeps the control: hiding a real opt-out is the worse of the two failures.
  if (status === undefined || !statuses) return true;

  return status !== statuses.UNKNOWN && status !== statuses.CONSENT_NOT_REQUIRED;
}

/**
 * Withdrawing consent has to be as easy as giving it, so the footer offers the
 * control as soon as the CMP reports a choice it can reopen, and stays out of
 * the way everywhere else.
 */
export function ConsentLink() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    window.googlefc ??= {};
    window.googlefc.callbackQueue ??= [];
    window.googlefc.callbackQueue.push({
      CONSENT_DATA_READY: () => setAvailable(revocable(window.googlefc)),
    });
  }, []);

  if (!available) return null;

  return (
    <button className="footer-consent" onClick={() => window.googlefc?.showRevocationMessage?.()} type="button">
      Gestisci il consenso
    </button>
  );
}
