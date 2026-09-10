/** Shared between the server layout (inline script) and the client intro component. */
export const INTRO_STORAGE_KEY = "siamo-intro";
export const INTRO_MIN_DURATION = 600;
export const INTRO_EXIT_DURATION = 500;
export const INTRO_LOAD_TIMEOUT = 8000;
export const WORDMARK_READY_EVENT = "siamo:wordmark-ready";
export const INTRO_FINISHED_EVENT = "siamo:intro-finished";

/** Before first paint: cover the home until its actual WebGL frame is ready. */
export const INTRO_SCRIPT = `(function(){
  var root=document.documentElement,seen=false;
  try{seen=!!sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)})}catch(e){}
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var home=location.pathname==="/";
  var studio=location.pathname.indexOf("/studio")===0;
  root.dataset.js="true";
  root.dataset.introSeen=seen?"true":"false";
  root.dataset.introStarted=String(performance.now());
  root.dataset.intro=reduce||studio||(!home&&seen)?"skip":"play";
  if(home)root.dataset.wordmark=reduce?"fallback":"loading";
  if(root.dataset.intro==="play")setTimeout(function expire(){
    if(root.dataset.intro==="skip")return;
    if(document.hidden){setTimeout(expire,1000);return}
    if(root.dataset.wordmark==="loading")root.dataset.wordmark="fallback";
    root.dataset.intro="skip";
    window.dispatchEvent(new Event(${JSON.stringify(WORDMARK_READY_EVENT)}));
    window.dispatchEvent(new Event(${JSON.stringify(INTRO_FINISHED_EVENT)}));
  },${INTRO_LOAD_TIMEOUT});
})()`;

/** The curtain releases on readiness; its exit, not a second load timer, starts the wave. */
export function connectIntro(win: Window & typeof globalThis = window) {
  const root = win.document.documentElement;
  const overlay = win.document.querySelector(".site-intro");
  const preference = win.matchMedia("(prefers-reduced-motion: reduce)");
  let minimumTimer: number | undefined, exitTimer: number | undefined;
  function finish() {
    if (minimumTimer !== undefined) win.clearTimeout(minimumTimer);
    if (exitTimer !== undefined) win.clearTimeout(exitTimer);
    if (root.dataset.intro === "skip") return;
    root.dataset.intro = "skip";
    try { win.sessionStorage.setItem(INTRO_STORAGE_KEY, "1"); } catch { /* Optional session storage. */ }
    win.dispatchEvent(new win.Event(INTRO_FINISHED_EVENT));
  }
  function reveal() {
    if (preference.matches) { finish(); return; }
    if (root.dataset.intro === "reveal") {
      if (exitTimer === undefined) exitTimer = win.setTimeout(finish, INTRO_EXIT_DURATION + 80);
      return;
    }
    if (root.dataset.intro !== "play" || root.dataset.wordmark === "loading") return;
    const minimum = root.dataset.introSeen === "true" ? 0 : INTRO_MIN_DURATION;
    const remaining = Number(root.dataset.introStarted || 0) + minimum - win.performance.now();
    if (minimumTimer !== undefined) win.clearTimeout(minimumTimer);
    if (remaining > 0) { minimumTimer = win.setTimeout(reveal, remaining); return; }
    root.dataset.intro = "reveal";
    // animationend is the normal path; the timer covers disabled/interrupted CSS animation.
    exitTimer = win.setTimeout(finish, INTRO_EXIT_DURATION + 80);
  }
  function animationEnded(event: Event) {
    if (event.target === overlay && (event as AnimationEvent).animationName === "intro-curtain") finish();
  }
  win.addEventListener(WORDMARK_READY_EVENT, reveal);
  overlay?.addEventListener("animationend", animationEnded);
  preference.addEventListener("change", reveal);
  reveal();
  return () => {
    if (minimumTimer !== undefined) win.clearTimeout(minimumTimer);
    if (exitTimer !== undefined) win.clearTimeout(exitTimer);
    win.removeEventListener(WORDMARK_READY_EVENT, reveal);
    overlay?.removeEventListener("animationend", animationEnded);
    preference.removeEventListener("change", reveal);
    if (overlay && !overlay.isConnected) finish();
  };
}
