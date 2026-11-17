// lib/tour/useTour.ts
"use client";

import { useEffect, useRef } from "react";
import { useTourStore } from "@/store/useTourStore";
import { TOURS_REGISTRY, type AdminTourId } from "./tours";
import type { Driver } from "driver.js";

interface UseTourOptions {
  /** Wait until data queries or RBAC checks complete before starting */
  ready?: boolean;
  /** Force re-run even if marked completed */
  force?: boolean;
}

export function useTour(tourId: AdminTourId, options: UseTourOptions = {}) {
  const { ready = true, force = false } = options;
  const { isTourCompleted, markTourCompleted, setActiveTour } = useTourStore();
  const driverInstanceRef = useRef<Driver | null>(null);

  useEffect(() => {
    // 1. Skip if tests disabled tours
    if (process.env.NEXT_PUBLIC_DISABLE_TOURS === "true") return;

    // 2. Gate on readiness and completion
    if (!ready) return;
    if (!force && isTourCompleted(tourId)) return;

    const tourDef = TOURS_REGISTRY[tourId];
    if (!tourDef || tourDef.steps.length === 0) return;

    let cancelled = false;

    // 3. Small delay to ensure elements are mounted in the DOM
    const timer = setTimeout(async () => {
      try {
        const { driver } = await import("driver.js");
        await import("driver.js/dist/driver.css");

        if (cancelled) return;

        // Dev-mode verification: check if selector targets exist
        if (process.env.NODE_ENV === "development") {
          tourDef.steps.forEach((step, idx) => {
            if (typeof step.element === "string" && !document.querySelector(step.element)) {
              console.warn(
                `[driver.js] Tour "${tourId}" step #${idx + 1} target not found: "${step.element}"`
              );
            }
          });
        }

        const driverInstance = driver({
          ...tourDef.config,
          steps: tourDef.steps,
          onDestroyStarted: () => {
            driverInstance.destroy();
            markTourCompleted(tourId);
            setActiveTour(null);
          },
        });

        driverInstanceRef.current = driverInstance;
        setActiveTour(tourId);
        driverInstance.drive();
      } catch (err) {
        console.error(`[driver.js] Failed to launch tour ${tourId}:`, err);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
        driverInstanceRef.current = null;
      }
    };
  }, [tourId, ready, force, isTourCompleted, markTourCompleted, setActiveTour]);

  return {
    startTour: () => {
      const tourDef = TOURS_REGISTRY[tourId];
      if (!tourDef) return;

      // Fix confirmed bug: destroy existing instance to eliminate singleton pointer collisions
      driverInstanceRef.current?.destroy();

      import("driver.js").then(({ driver }) => {
        import("driver.js/dist/driver.css").then(() => {
          const d = driver({
            ...tourDef.config,
            steps: tourDef.steps,
            onDestroyStarted: () => {
              d.destroy();
              markTourCompleted(tourId);
              setActiveTour(null);
            },
          });
          driverInstanceRef.current = d;
          d.drive();
        });
      });
    },
  };
}
