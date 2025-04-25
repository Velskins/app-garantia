import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface Garantie {
  id: string;
  nom: string;
  date_achat: string;
  date_fin: string;
  duree_mois: number;
  facture_url?: string | null;
}

export default function GarantieDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [garantie, setGarantie] = useState<Garantie | null>(null);

  useEffect(() => {
    const fetchGarantie = async () => {
      if (!id || typeof id !== "string") return;

      const { data, error } = await supabase
        .from("garanties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur de chargement :", error.message);
      } else {
        setGarantie(data);
      }
    };

    fetchGarantie();
  }, [id]);

  if (!garantie) {
    return <div className="p-4 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="min-h-screen p-4 bg-white">
      <button
        onClick={() => router.back()}
        className="text-blue-600 mb-4 underline"
      >
        ← Retour
      </button>

      <h1 className="text-2xl font-bold mb-2">{garantie.nom}</h1>
      <p className="text-sm text-gray-700">
        📅 Date d'achat : {garantie.date_achat}
      </p>
      <p className="text-sm text-gray-700">
        ⌛ Fin de garantie : {garantie.date_fin}
      </p>
      <p className="text-sm text-gray-700 mb-4">
        🕒 Durée : {garantie.duree_mois} mois
      </p>

      {garantie.facture_url ? (
        <div className="relative w-full h-64 border rounded overflow-hidden">
          <Image
            src={garantie.facture_url}
            alt="Facture"
            layout="fill"
            objectFit="contain"
          />
        </div>
      ) : (
        <p className="text-gray-400 italic">Aucune facture liée</p>
      )}
    </div>
  );
}