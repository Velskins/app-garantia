import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

interface Garantie {
  id: string;
  nom: string;
  date_fin: string;
}

export default function Reminders() {
  const router = useRouter();
  const [rappels, setRappels] = useState<Garantie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRappels = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        router.replace("/auth");
        return;
      }

      const userId = session.user.id;
      const aujourdHui = new Date();
      const dans30Jours = new Date();
      dans30Jours.setDate(aujourdHui.getDate() + 30);

      const { data, error } = await supabase
        .from("garanties")
        .select("id, nom, date_fin")
        .eq("user_id", userId);

      if (!error && data) {
        const rappelsFiltres = data.filter((g) => {
          const dateFin = new Date(g.date_fin);
          return dateFin >= aujourdHui && dateFin <= dans30Jours;
        });

        setRappels(rappelsFiltres);
      }

      setIsLoading(false);
    };

    fetchRappels();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement des rappels...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">Rappels</h1>
        <p className="text-sm text-gray-500">
          Garanties expirant dans les 30 jours
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {rappels.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun rappel pour le moment.</p>
        ) : (
          rappels.map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-xl bg-yellow-50 border border-yellow-300 shadow"
            >
              <h2 className="text-lg font-semibold text-yellow-900">{g.nom}</h2>
              <p className="text-sm text-yellow-800">
                Garantie expire le {g.date_fin}
              </p>
            </div>
          ))
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around py-2 z-50">
        <Link href="/dashboard">
          <span className="text-sm text-blue-600 font-medium">Garanties</span>
        </Link>
        <Link href="/reminders">
          <span className="text-sm text-gray-700">Rappels</span>
        </Link>
        <Link href="/profile">
          <span className="text-sm text-gray-700">Profil</span>
        </Link>
      </nav>
    </div>
  );
}