import Image from "next/image"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Cpu, Home, Car } from "lucide-react"; // ou vos icônes métier
import { supabase } from "@/lib/supabaseClient";
import nav1 from "@/assets/images/nav_image/nav_dashboard.png";
import nav2 from "@/assets/images/nav_image/nav_reminders.png";
import nav3 from "@/assets/images/nav_image/nav_comp.png";
import nav4 from "@/assets/images/nav_image/nav_profile.png";

interface Garantie {
  id: string;
  marque: string;
  produit: string;
  date_fin: string;
}

export default function Reminders() {
  const router = useRouter();
  const [rappels, setRappels] = useState<Garantie[]>([]);
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
    };

    fetchRappels();
  }, [router]);



  return (
    <div className="min-h-screen flex flex-col bg-white pb-20">
      <div className="p-10">
        <h1 className="text-4xl font-bold underline decoration-4 decoration-black underline-offset-2 mb-4">
          Rappels
        </h1>
        <p className="text-xl text-black-500 mb-5
      ">
          Garanties expirant dans les 30 jours
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-10 pb-4 space-y-4">
  {rappels.length === 0 ? (
    <p className="text-sm text-gray-400">Aucun rappel pour le moment.</p>
  ) : (
    rappels.map((g, i) => {
      // Calcul du J-jours
      const joursRestants = differenceInCalendarDays(
        parseISO(g.date_fin),
        new Date()
      );
      // Palette cyclique
      const palette = [
        { bg: "bg-yellow-50", fg: "text-yellow-900", Icon: Cpu },
        { bg: "bg-yellow-50", fg: "text-yellow-900", Icon: Home },
        { bg: "bg-yellow-50", fg: "text-yellow-900", Icon: Car },
      ];
      const { bg, fg, Icon } = palette[i % palette.length];

      return (
        <div key={g.id} className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            {/* Icône + texte */}
            <div className="flex items-center">
              <div className={`${bg} px-9 py-8 rounded-2xl mr-4`}>
                <Icon className={`w-10 h-10 ${fg}`} />
              </div>
              <div className="flex flex-col">
                {/* Marque */}
                <p className="text-base font-black uppercase text-gray-900 leading-tight">
                  {g.marque}
                </p>
                {/* Nom du produit */}
                <p className="text-sm font-medium text-gray-700">
                  {g.produit}
                </p>
                {/* Date d’expiration */}
                <p className="mt-1 text-sm text-blue-600">
                  Garantie expire le<br/>
                  <strong>{g.date_fin}</strong>
                </p>
              </div>
            </div>

            {/* Badge J-N */}
            <span className="bg-yellow-200 text-yellow-900 w-12 text-xs font-semibold px-2 py-1 rounded">
              J-{joursRestants}
            </span>
          </div>
        </div>
      );
    })
  )}
</div>
<div
  style={{ background: "linear-gradient(to top, white 75%, transparent 100%)" }}
  className="fixed bottom-0 left-0 right-0 h-60 px-4 flex items-center justify-between"
>

    <nav className="fixed bottom-5 left-10 right-10 shadow-t flex items-center z-50">
    <div className="fixed bottom-24 left-0 right-0 px-4">
      <div className="mt-4">
      <button
  onClick={() =>
    router.push({
      pathname: "/dashboard",
      query: { ajout: "1" },
    })
  }
  className="fixed bottom-20 left-10 right-10
    bg-black text-white py-3 text-center font-medium z-40"
>
  J&apos;ajoute une garantie
</button>
</div>
    </div>

    <Link
    href="/dashboard"
    className="w-1/4 flex-1 flex justify-center items-center"
  >

      <Image src={nav1} alt="Garanties" width={30} height={30} />
  </Link>

  {/* Rappels */}
  <Link href="/reminders" className="w-1/4 flex-1 flex justify-center items-center">
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
  <Link href="/comparateur" className=" w-1/4 flex-1 flex justify-center items-center">
    <Image src={nav3} alt="Ajouter" width={45} height={45} />
  </Link>

  {/* Profil */}
  <Link href="/profile" className="w-1/4 flex-1 flex justify-center items-center">
    <Image src={nav4} alt="Profil" width={40} height={40} />
  </Link>
</nav>

</div>

</div>
  );
}