// pages/profile/settings.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
export default function SettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("Français");
  const [darkMode, setDarkMode] = useState(false);

  // TODO : charger / sauvegarder ces préférences via Supabase ou Context

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <ChevronLeft
          className="w-6 h-6 mr-3 text-gray-900 cursor-pointer"
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-extrabold underline decoration-4 decoration-black underline-offset-2">
          Paramètres
        </h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Langue */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            LANGUAGE
          </label>
          <div className="px-4 py-2 bg-green-50 rounded-lg">
            {language}
          </div>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">
            DARK MODE
          </span>
          <button
            type="button"
            aria-pressed={darkMode}
            onClick={() => setDarkMode((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              darkMode ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`block bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bouton + nav */}
      <button
        onClick={() => router.push({ pathname: "/dashboard", query: { ajout: "1" } })}
        className="fixed bottom-16 left-4 right-4 bg-black text-white py-3 text-center font-medium z-40"
      >
        J&apos;ajoute une garantie
      </button>
    </div>
  );
}