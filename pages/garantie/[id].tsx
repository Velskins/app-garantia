// pages/garantie/[id].tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Hourglass } from "lucide-react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

interface Garantie {
  id: string;
  marque: string;
  produit: string;
  date_achat: string;
  date_fin: string;
  duree_mois: number;
  facture_url?: string;
  expired?: boolean;
}

export default function GarantieDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [garantie, setGarantie] = useState<Garantie | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchGarantie = async () => {
      const { data, error } = await supabase
      .from("garanties")
        .select("id, marque, produit, date_achat, date_fin, duree_mois, facture_url")
        .eq("id", id)
        .single();
      if (error) {
        console.error(error);
        return;
      }
      setGarantie(data);
    };
    fetchGarantie();
  }, [id]);

  if (!garantie) {
    return <div className="p-4 text-gray-700">Chargement...</div>;
  }

  const joursRestants = differenceInCalendarDays(
    parseISO(garantie.date_fin),
    new Date()
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 1. Header with back arrow */}
      <div className="flex items-center px-4 py-3">
        <ChevronLeft
          className="w-6 h-6 mr-3 text-gray-900 cursor-pointer"
          onClick={() => router.back()}
        />
        <div>
          <h1 className="text-2xl font-extrabold underline decoration-4 decoration-black underline-offset-2">
            Mes garanties
          </h1>
          <h2 className="text-base font-medium text-gray-700 mt-1">
            {garantie.produit}
          </h2>
        </div>
      </div>

      {/* 2. Info block */}
      <div className="px-4 mb-6">
        <div className="flex items-start">
          <div className="bg-pink-50 p-4 rounded-xl mr-4">
            <Hourglass className="w-8 h-8 text-pink-600" />
          </div>
          <div className="flex-1">
            <p className="text-base font-black uppercase text-gray-900 leading-tight">
              {garantie.marque}
            </p>
            <p className="text-sm font-medium text-gray-700 mt-1">
              {garantie.produit}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">
                  Acheté : {garantie.date_achat}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Expire : {garantie.date_fin}
                </p>
              </div>
              <span className="bg-yellow-200 text-yellow-900 text-xs font-semibold px-2 py-1 rounded">
                J-{joursRestants}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Action buttons */}
      <div className="px-4 space-y-3">
        <button className="flex justify-between items-center w-full p-4 bg-green-50 rounded-2xl">
          <span className="text-base font-black underline">Ajouter un fichier</span>
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
        <button className="flex justify-between items-center w-full p-4 bg-indigo-50 rounded-2xl">
          <span className="text-base font-black underline">Ajouter un rappel</span>
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
        <button className="flex justify-between items-center w-full p-4 bg-yellow-50 rounded-2xl">
          <span className="text-base font-black underline">Modifier la garantie</span>
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
        <button className="flex justify-between items-center w-full p-4 bg-pink-50 rounded-2xl">
          <span className="text-base font-black underline">Supprimer la garantie</span>
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* 4. Footer “J’ajoute une garantie” */}
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
    </div>
  );
}