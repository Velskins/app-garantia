import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    };
    checkSession();
  }, [router]); // ✅ Ajout de router dans les dépendances

  const handleLogin = async () => {
    setErreur("");

    if (!email || !password) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErreur("Identifiants incorrects.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-xl font-bold text-black-800 text-center">Connexion</h1>

        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded-lg text-sm"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded-lg text-sm"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Se connecter
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="text-sm text-blue-600 hover:underline"
        >
          Créer un compte
        </button>
      </div>
    </div>
  );
}