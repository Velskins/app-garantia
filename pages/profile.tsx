import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function Profile() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [afficheFormulaire, setAfficheFormulaire] = useState(false);
  const [nouveauMDP, setNouveauMDP] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      const user = session?.user as { email: string } | null;

      if (!user) {
        router.replace("/auth");
        return;
      }

      setEmail(user.email);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const supprimerCompte = async () => {
    const confirmationSuppression = confirm("Êtes-vous sûr de vouloir supprimer votre compte ?");
    if (!confirmationSuppression) return;

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      alert("Utilisateur introuvable.");
      return;
    }

    alert("Supabase ne permet pas la suppression directe en front-end. À gérer plus tard côté back-end.");
  };

  const modifierMotDePasse = async () => {
    setMessage("");

    if (!nouveauMDP || !confirmation) {
      setMessage("Veuillez remplir les deux champs.");
      return;
    }

    if (nouveauMDP !== confirmation) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: nouveauMDP,
    });

    if (error) {
      setMessage("Erreur lors de la mise à jour.");
    } else {
      setMessage("Mot de passe mis à jour !");
      setNouveauMDP("");
      setConfirmation("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pb-24">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">Mon profil</h1>
        <p className="text-sm text-gray-500">Connecté en tant que :</p>
        {email ? (
          <p className="text-sm text-gray-700 font-semibold mt-1">{email}</p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">Chargement...</p>
        )}
      </div>

      <div className="px-4 flex flex-col gap-3">
        <button
          onClick={() => setAfficheFormulaire((prev) => !prev)}
          className="text-left text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
        >
          {afficheFormulaire ? "Fermer le formulaire" : "Modifier mon mot de passe"} 🔽
        </button>

        {afficheFormulaire && (
          <>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={nouveauMDP}
              onChange={(e) => setNouveauMDP(e.target.value)}
              className="border p-2 rounded-lg text-sm"
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="border p-2 rounded-lg text-sm"
            />
            <button
              onClick={modifierMotDePasse}
              className="py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Enregistrer les modifications
            </button>
            {message && <p className="text-sm text-green-600">{message}</p>}
          </>
        )}

        <hr className="my-4" />

        <button
          onClick={supprimerCompte}
          className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition"
        >
          Supprimer mon compte
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-3 mt-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
        >
          Se déconnecter
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around py-2 z-50">
        <Link href="/dashboard">
          <span className="text-sm text-gray-700">Garanties</span>
        </Link>
        <Link href="/reminders">
          <span className="text-sm text-gray-700">Rappels</span>
        </Link>
        <Link href="/profile">
          <span className="text-sm text-blue-600 font-medium">Profil</span>
        </Link>
      </nav>
    </div>
  );
}