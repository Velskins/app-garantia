import Image from "next/image"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import nav1 from "@/assets/images/nav/nav1.png";
import nav2 from "@/assets/images/nav/nav2.png";
import nav3 from "@/assets/images/nav/nav3.png";
import nav4 from "@/assets/images/nav/nav4.png";

interface Garantie {
  id: string;
  marque: string;
  produit: string;
  date_fin: string;
}

export default function Reminders() {
  const router = useRouter();
  const [rappels, setRappels] = useState<Garantie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useRouter();

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
        .select("id, marque, produit, date_fin")
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
      <div className="min-h-screen flex items-center justify-center text-black-500">
        Chargement des rappels...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      <div className="p-4">
        <h1 className="text-xl font-bold text-black-800">Rappels</h1>
        <p className="text-sm text-black-500">
          Garanties expirant dans les 30 jours
        </p>
      </div>

      <div className="flex flex-col gap-4 px-4">
  {rappels.length === 0 ? (
    <p className="text-sm text-black-400">Aucun rappel pour le moment.</p>
  ) : (
    rappels.map((g) => (
      <div
        key={g.id}
        className="p-4 rounded-xl bg-yellow-50 border border-yellow-300 shadow"
      >
        {/* 1. Marque */}
        <p className="text-base font-bold uppercase text-yellow-900">
          {g.marque}
        </p>
        {/* 2. Nom du produit */}
        <p className="text-sm font-bold text-yellow-700 mt-1">
          {g.produit}
        </p>
        {/* 3. Date d’expiration */}
        <p className="text-sm text-yellow-800 mt-2">
          Expire le {g.date_fin}
        </p>
      </div>
    ))
  )}
</div>

<nav className="fixed bottom-5 left-10 right-10 bg-[#f7f7f7] shadow-t flex items-center z-50">
  {/* Dashboard */}
  <Link
    href="/dashboard"
    className="flex-1 flex justify-center items-center"
  >

      <Image src={nav1} alt="Garanties" width={30} height={30} />
  </Link>

  {/* Rappels */}
  <Link href="/reminders" className="flex-1 flex justify-center items-center">
  <div
      className={`
        py-4 px-6
        ${pathname === "/reminders"
          ? "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-200"
          : ""}
      `}
    >
    <Image src={nav2} alt="Rappels" width={30} height={30} />
    </div>
  </Link>

  {/* Ajouter */}
  <Link href="/add" className="flex-1 flex justify-center items-center">
    <Image src={nav3} alt="Ajouter" width={45} height={45} />
  </Link>

  {/* Profil */}
  <Link href="/profile" className="flex-1 flex justify-center items-center">
    <Image src={nav4} alt="Profil" width={30} height={30} />
  </Link>
</nav>
    </div>
  );
}