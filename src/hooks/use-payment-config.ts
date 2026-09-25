import { useEffect, useState } from "react";
import { getPublicPaymentConfig } from "@/server/payment";

export type PublicPayMethod = { id: string; label: string; enabled: boolean };

export type PublicPaymentConfig = {
  activeGateway: "tripay" | "tokopay" | "manual";
  mode: "sandbox" | "live";
  methods: PublicPayMethod[];
  staticQrisUrl: string;
  shipping: { javaFee: number; outsideJavaFee: number };
};

export function usePaymentConfig() {
  const [config, setConfig] = useState<PublicPaymentConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPublicPaymentConfig()
      .then((c) => {
        if (!cancelled) setConfig(c);
      })
      .catch(() => {
        // Gagal memuat (offline) — biarkan null, tombol tetap tampil default
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enabled = (id: string) =>
    config ? config.methods.some((m) => m.id === id && m.enabled) : true;

  const onlineMethods =
    config?.methods.filter((m) => m.enabled && m.id !== "cod" && m.id !== "manual_wa") ?? [];

  /** Semua metode untuk popup checkout (termasuk COD, tanpa transfer manual). */
  const checkoutMethods = config?.methods.filter((m) => m.enabled && m.id !== "manual_wa") ?? [];

  const canInstantCheckout =
    !config || (config.activeGateway !== "manual" && onlineMethods.length > 0) || enabled("cod");

  return { config, enabled, onlineMethods, checkoutMethods, canInstantCheckout };
}
