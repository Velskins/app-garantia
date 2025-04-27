import Image from "next/image"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Camera, FileText, Edit3 } from "lucide-react";

import { Cpu, Home, Car } from "lucide-react"; // ou vos icônes métier
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
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);


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
        <h1 className="text-4xl font-semibold underline decoration-4 decoration-black underline-offset-2 mb-4">
          Rappels
        </h1>
        <p className="text-xl text-black-500 mb-5
      ">
          Garanties expirant dans les 30 jours
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
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
              <div className={`${bg} px-9 py-8 rounded-2uyuloplppppà^)xl mr-4`}>
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
                  Garantie expire le {g.date_fin}
                </p>
              </div>
            </div>

            {/* Badge J-N */}
            <span className="bg-yellow-200 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
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
    <div className="fixed bottom-24 left-0 right-0 px-4">
      <div className="mt-4">
      <button
  onClick={() => setAjoutVisible(true)}
className="fixed bottom-21 left-10 right-10
    bg-black text-white py-3 text-center font-medium z-40
  "
>
J&apos;ajoute une garantie
</button>
{ajoutVisible && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* 1) Overlay cliquable pour fermer */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setAjoutVisible(false)}
          />

          {/* 2) Le menu, stoppe la propagation */}
          <div
            className="relative w-full p-4 space-y-3 rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Option Photo */}
            <button
              onClick={() => {
                /* ta logique photo */
                setAjoutVisible(false);
              }}
              className="flex items-center w-full p-3 bg-yellow-50 rounded-2xl mb-5"
            >
              <Camera className="w-5 h-5 mr-3 text-yellow-900" />
              <span className="font-medium text-yellow-900">
                Ajouter depuis une photo
              </span>
            </button>

            {/* Option Fichier */}
            <button
              onClick={() => {
                /* ta logique fichier */
                setAjoutVisible(false);
              }}
              className="flex items-center w-full p-3 bg-indigo-50 rounded-2xl mb-5"
            >
              <FileText className="w-5 h-5 mr-3 text-indigo-900" />
              <span className="font-medium text-indigo-900">
                Ajouter depuis un fichier
              </span>
            </button>

            {/* Option Manuel */}
            <button
              onClick={() => {
                setFormVisible(true);
                setAjoutVisible(false);
              }}
              className="flex items-center w-full p-3 bg-green-50 rounded-2xl mb-30"
            >
              <Edit3 className="w-5 h-5 mr-3 text-green-900" />
              <span className="font-medium text-green-900">
                Ajouter manuellement
              </span>
            </button>
          </div>
        </div>
      )} 

</div>
    </div>

    <nav className="fixed bottom-5 left-10 right-10 shadow-t flex items-center z-50">
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
  <Link href="/comparateur" className="flex-1 flex justify-center items-center">
    <Image src={nav3} alt="Ajouter" width={45} height={45} />
  </Link>

  {/* Profil */}
  <Link href="/profile" className="flex-1 flex justify-center items-center">
    <Image src={nav4} alt="Profil" width={30} height={30} />
  </Link>
</nav>

</div>

</div>
  );
}