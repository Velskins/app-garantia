// pages/comparateur.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import nav1 from "@/assets/images/nav_image/nav_dashboard.png";
import nav2 from "@/assets/images/nav_image/nav_reminders.png";
import nav3 from "@/assets/images/nav_image/nav_comp.png";
import nav4 from "@/assets/images/nav_image/nav_profile.png";

export default function Comparateur() {
  const router = useRouter();
  const { pathname } = router;
  const [notify, setNotify] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1) Récupérer l’ID utilisateur et son setting
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data, error } = await supabase
          .from("comparateur_subscriptions")
          .select("notify")
          .eq("user_id", uid)
          .single();
        if (!error && data) {
          setNotify(data.notify);
        }
      }
    })();
  }, []);

  // 2) Fonction pour basculer la notification
  const toggleNotify = async () => {
    if (!userId) return;
    const newVal = !notify;
    setNotify(newVal);
    const { error } = await supabase
      .from("comparateur_subscriptions")
      .upsert({ user_id: userId, notify: newVal });
    if (error) console.error("toggleNotify error", error);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-10">
        {/* 1. En-tête */}
        <h1 className="text-4xl font-bold underline decoration-4 decoration-black underline-offset-2 mb-4">
          Comparateur
        </h1>

        {/* 2. Sous-titres */}
        <p className="text-base text-gray-900 mb-1">
          Et si la meilleure offre n’était pas la moins chère ?
        </p>
        <p className="text-sm text-gray-700 mb-6">
          Comparez les garanties avant d’acheter.
        </p>

        {/* 3. Aperçu flou + overlay “Arrive bientôt” */}
        <div className="relative mb-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="bg-gray-100 h-48 w-full animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-200 via-yellow-200 to-blue-200 bg-opacity-60 backdrop-blur-sm">
            <span className="text-lg font-medium text-gray-900">
              ARRIVE BIENTÔT
            </span>
          </div>
        </div>

        {/* 4. Description */}
        <p className="text-sm text-gray-700 mb-6">
          Nous construisons une fonctionnalité inédite pour vous aider à choisir
          vos produits selon ce qui compte vraiment : leur durée de vie, leur
          couverture, et les conditions de garantie.
        </p>

        {/* 5. Toggle “Me prévenir dès que disponible” */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-gray-900">
            ME PRÉVENIR DÈS QUE DISPONIBLE
          </span>
          <button
            type="button"
            aria-pressed={notify}
            onClick={toggleNotify}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notify ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`block bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                notify ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <nav className="fixed bottom-5 left-10 right-10 shadow-t flex items-center z-50">



      {/* Bouton fixe “J’ajoute une garantie” */}

<button
  onClick={() =>
    router.push({
      pathname: "/dashboard",
      query: { ajout: "1" },
    })
  }
  className="fixed bottom-21 left-10 right-10
    bg-black text-white py-3 text-center font-medium z-40"
>
  J&apos;ajoute une garantie
</button>

      {/* Navigation */}

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className="w-1/4 flex justify-center items-center"
        >
          <Image src={nav1} alt="Garanties" width={30} height={30} />
        </Link>

        {/* Rappels */}
        <Link
          href="/reminders"
          className="w-1/4 flex justify-center items-center"
        >
          <Image src={nav2} alt="Rappels" width={30} height={30} />
        </Link>

        {/* Comparateur (actif) */}
        <Link
          href="/comparateur"
          className="w-1/4 flex justify-center items-center"
        >
          <div
            className={`py-4 px-6 ${
              pathname === "/comparateur"
                ? "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-200"
                : ""
            }`}
          >
            <Image src={nav3} alt="Ajouter" width={45} height={45} />
          </div>
        </Link>

        {/* Profil */}
        <Link
          href="/profile"
          className="w-1/4 flex justify-center items-center"
        >
          <Image src={nav4} alt="Profil" width={40} height={40} />
        </Link>
      </nav>
    </div>
  );
}