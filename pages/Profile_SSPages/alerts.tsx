// pages/profile/alerts.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AlertsPage() {
  const router = useRouter();
  const [delay, setDelay] = useState<string>("30");
  const [emailAlerts, setEmailAlerts] = useState(false);

  // TODO : charger delay & emailAlerts depuis Supabase

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <ChevronLeft
          className="w-6 h-6 mr-3 text-gray-900 cursor-pointer"
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-extrabold underline decoration-4 decoration-black underline-offset-2">
          Alertes
        </h1>
      </div>

      <div className="px-4 space-y-6">
        {/* 1) Échéance des rappels */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            MODIFIER L’ÉCHÉANCE DES RAPPELS
          </label>
          <select
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg"
          >
            <option value="7">7 jours</option>
            <option value="15">15 jours</option>
            <option value="30">30 jours</option>
            <option value="60">60 jours</option>
          </select>
        </div>

        {/* 2) Toggle email */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">
            RECEVOIR LES ALERTES PAR E-MAIL
          </span>
          <button
            type="button"
            aria-pressed={emailAlerts}
            onClick={() => setEmailAlerts((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              emailAlerts ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`block bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                emailAlerts ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* “J’ajoute” + BottomNav */}
      <button
        onClick={() => router.push({ pathname: "/dashboard", query: { ajout: "1" } })}
        className="fixed bottom-16 left-4 right-4 bg-black text-white py-3 text-center font-medium z-40"
      >
        J&apos;ajoute une garantie
      </button>
    </div>
  );
}