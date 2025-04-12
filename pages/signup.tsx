import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setErreur("");
    setMessage("");

    if (!email || !password) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErreur(error.message);
    } else {
      setMessage("Compte créé ! Vous pouvez maintenant vous connecter.");
      setTimeout(() => router.push("/auth"), 2000); // redirection douce
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-xl font-bold text-black-800 text-center">Créer un compte</h1>

        {erreur && <p className="text-red-500 text-sm">{erreur}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

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
          onClick={handleSignup}
          className="bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
        >
          Créer mon compte
        </button>
        <button
          onClick={() => router.push("/auth")}
          className="text-blue-600 text-sm hover:underline"
        >
          J&apos;ai déjà un compte
        </button>
      </div>
    </div>
  );
}