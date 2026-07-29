import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { onboardingSteps, type OnboardingStep, type TourAction } from "./steps";

export const onboardingStorageKey = "onboarding:v1";

declare global {
  interface Window {
    startTour?: typeof startTour;
    resetTour?: typeof resetTour;
  }

  interface WindowEventMap {
    "apeterm:tour-action": CustomEvent<TourAction>;
  }
}

let activeTour: Driver | null = null;
let destroyingTour = false;
let tourRunId = 0;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function markComplete() {
  window.localStorage.setItem(onboardingStorageKey, "1");
}

function targetSelector(step?: OnboardingStep) {
  return typeof step.element === "string" ? step.element : "";
}

function scrollTargetIntoView(element?: Element) {
  element?.scrollIntoView({
    block: "center",
    inline: "center",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function runAction(action?: TourAction) {
  if (!action) return;
  window.dispatchEvent(new CustomEvent("apeterm:tour-action", { detail: action }));
}

async function waitForTarget(step?: OnboardingStep, timeoutMs = 5_000) {
  runAction(step?.action);
  const selector = targetSelector(step);
  if (!selector || document.querySelector(selector)) return;
  const started = Date.now();
  await new Promise<void>((resolve) => {
    const timer = window.setInterval(() => {
      if (document.querySelector(selector) || Date.now() - started >= timeoutMs) {
        window.clearInterval(timer);
        resolve();
      }
    }, 80);
  });
}

async function moveToPrepared(tour: Driver, index: number) {
  const step = onboardingSteps[index];
  await waitForTarget(step);
  tour.moveTo(index);
}

export async function startTour({ force = true }: { force?: boolean } = {}) {
  if (typeof window === "undefined") return;
  if (!force && window.localStorage.getItem(onboardingStorageKey)) return;

  const runId = ++tourRunId;
  activeTour?.destroy();
  activeTour = null;
  destroyingTour = false;
  await waitForTarget(onboardingSteps[0]);
  if (runId !== tourRunId) return;

  const reducedMotion = prefersReducedMotion();
  activeTour = driver({
    steps: onboardingSteps,
    popoverClass: "apeterm-driver-popover",
    overlayColor: "var(--terminal-bg)",
    overlayOpacity: 0.82,
    stagePadding: 8,
    stageRadius: 4,
    popoverOffset: 12,
    allowClose: true,
    allowKeyboardControl: true,
    overlayClickBehavior: "close",
    showProgress: true,
    progressText: "{{current}} of {{total}}",
    showButtons: ["previous", "next", "close"],
    prevBtnText: "Back",
    nextBtnText: "Next",
    doneBtnText: "Done",
    animate: !reducedMotion,
    duration: reducedMotion ? 0 : 650,
    smoothScroll: !reducedMotion,
    waitForElement: 5_000,
    skipMissingElement: true,
    onHighlightStarted: (element) => scrollTargetIntoView(element),
    onNextClick: (_element, _step, { driver: tour }) => {
      const index = tour.getActiveIndex() ?? 0;
      if (tour.hasNextStep()) void moveToPrepared(tour, index + 1);
      else {
        markComplete();
        tour.destroy();
      }
    },
    onPrevClick: (_element, _step, { driver: tour }) => {
      const index = tour.getActiveIndex() ?? 0;
      if (tour.hasPreviousStep()) void moveToPrepared(tour, index - 1);
    },
    onDoneClick: (_element, _step, { driver: tour }) => {
      markComplete();
      tour.destroy();
    },
    onDestroyStarted: (_element, _step, { driver: tour }) => {
      if (destroyingTour) return;
      destroyingTour = true;
      markComplete();
      tour.destroy();
    },
    onDestroyed: () => {
      activeTour = null;
      destroyingTour = false;
    },
  });

  activeTour.drive(0);
}

export function startOnboardingTour() {
  void startTour({ force: true });
}

export function resetTour() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(onboardingStorageKey);
  void startTour({ force: true });
}

export function autoStartTour() {
  void startTour({ force: false });
}
