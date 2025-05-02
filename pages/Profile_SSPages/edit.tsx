// pages/profile/edit.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileEdit() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth");
        return;
      }
      const user = session.user;
      setEmail(user.email || "");
      // TODO: fetch fullName from your profile table
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: save fullName & potentially password via supabase.auth.updateUser / .from("users")
    router.back();
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <ChevronLeft
          className="w-6 h-6 mr-3 text-gray-900 cursor-pointer"
          onClick={() => router.back()}
        />
        <h1 className="text-2xl font-extrabold underline decoration-4 decoration-black underline-offset-2">
          Modifier mon profil
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            NOM COMPLET
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ajouter un nom"
            className="w-full px-4 py-2 bg-yellow-50 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-yellow-50 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            MOT DE PASSE
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ajouter un mot de passe"
            className="w-full px-4 py-2 bg-yellow-50 rounded-lg"
          />
        </div>

        <div>
          <button
            type="submit"
            className="text-red-500 text-sm underline"
          >
            Supprimer le compte
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
        >
          Enregistrer
        </button>
      </form>

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