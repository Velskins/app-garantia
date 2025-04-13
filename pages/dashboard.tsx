import Image from "next/image"
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import Tesseract from "tesseract.js";


interface Garantie {
  id?: string;
  nom: string;
  date_achat: string;
  date_fin: string;
  duree_mois: number;
  facture_url?: string | null;
}

const moisFrancais: { [key: string]: string } = {
  janvier: "01", février: "02", fevrier: "02", mars: "03", avril: "04",
  mai: "05", juin: "06", juillet: "07", août: "08", aout: "08",
  septembre: "09", octobre: "10", novembre: "11", décembre: "12", decembre: "12"
};

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [garanties, setGaranties] = useState<Garantie[]>([]);
  const [nomProduit, setNomProduit] = useState("");
  const [dateAchat, setDateAchat] = useState("");
  const [dureeMois, setDureeMois] = useState<number | "">("");
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [ocrVisible, setOcrVisible] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [editorGarantie, setEditorGarantie] = useState<Garantie | null>(null);
  const [garantieOuverteId, setGarantieOuverteId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        router.replace("/auth");
      } else {
        setUserId(session.user.id);
        fetchGaranties(session.user.id);
      }

      setIsLoading(false);
    };

    getSession();
  }, [router]);

  const fetchGaranties = async (uid: string) => {
    const { data } = await supabase
      .from("garanties")
      .select("*")
      .eq("user_id", uid)
      .order("date_achat", { ascending: false });

    if (data) setGaranties(data);
  };

  const ajouterGarantie = async () => {
    if (!nomProduit || !dateAchat || !dureeMois || !userId) {
      setErreur("Veuillez remplir tous les champs.");
      return;
    }

  const dateFinObj = new Date(dateAchat);
  dateFinObj.setMonth(dateFinObj.getMonth() + Number(dureeMois));
  const dateFin = dateFinObj.toISOString().split("T")[0];

  const { error } = await supabase.from("garanties").insert({
    nom: nomProduit,
    date_achat: dateAchat,
    date_fin: dateFin,
    duree_mois: Number(dureeMois),
    user_id: userId,
  });

  if (error) {
    setErreur("Erreur lors de l'ajout.");
  } else {
    setNomProduit("");
    setDateAchat("");
    setDureeMois("");
    setErreur("");
    fetchGaranties(userId);
  }
};
const supprimerGarantie = async (id: string) => {
  const { error } = await supabase.from("garanties").delete().eq("id", id);
  if (!error && userId) {
    fetchGaranties(userId);
  }
};

const parseDateFr = (texte: string): string => {
  const regex = /(\d{1,2})\s+([a-zA-Zéûîèà]+)\s+(\d{4})/i;
  const match = texte.match(regex);
  if (match) {
    const jour = match[1].padStart(2, "0");
    const moisNom = match[2].toLowerCase();
    const mois = moisFrancais[moisNom];
    const annee = match[3];
    if (mois) return `${annee}-${mois}-${jour}`;
  }
  return "";
};

const lancerOCR = async (file: File) => {
  const result = await Tesseract.recognize(file, "fra", {
    logger: (m) => console.log(m),
  });

  const texte = result.data.text;

  const lignes = texte.split("\n");
  const ligneNom = lignes.find((ligne) =>
    /(Produit|Article|Nom|Désignation|Référence)/i.test(ligne)
  );
  const nom = ligneNom ? ligneNom.split(":").pop()?.trim() || "" : "";

  let dateAchat = "";
  const formatISO = texte.match(/\b(20\d{2})[-\/\.](0?[1-9]|1[0-2])[-\/\.](0?[1-9]|[12][0-9]|3[01])\b/);
  if (formatISO) {
    dateAchat = formatISO[0].replace(/\./g, "-").replace(/\//g, "-");
  } else {
    dateAchat = parseDateFr(texte);
  }

  const dureeMatch =
    texte.match(/(\d{1,2})\s?(mois|MOIS|Mois)/) ||
    texte.match(/(\d{1,2})\s?(an|ans|année|années)/i);
  let duree = 12;
  if (dureeMatch) {
    const nombre = parseInt(dureeMatch[1]);
    const type = dureeMatch[2].toLowerCase();
    duree = type.startsWith("an") ? nombre * 12 : nombre;
  }

  setEditorGarantie({
    nom,
    date_achat: dateAchat,
    duree_mois: duree,
    date_fin: "",
  });
};

const handleFileSelect = (file: File | null) => {
  setUploadFile(file);
  if (file) {
    setUploadMessage(`✅ ${file.name} prêt à être analysé.`);
    lancerOCR(file);
  }
};

const validerGarantieOCR = async () => {
  if (!editorGarantie || !userId || !uploadFile) return;

  const { nom, date_achat, duree_mois } = editorGarantie;

  if (!nom || !date_achat || !duree_mois) {
    setUploadMessage("❌ Veuillez compléter tous les champs.");
    return;
  }

  const dateFinObj = new Date(date_achat);
  dateFinObj.setMonth(dateFinObj.getMonth() + Number(duree_mois));
  const date_fin = dateFinObj.toISOString().split("T")[0];

  console.log("📤 Upload vers Supabase lancé...");

  const { data: upload, error: uploadError } = await supabase.storage
    .from("factures")
    .upload(`${userId}/${Date.now()}_${uploadFile.name}`, uploadFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("❌ Échec de l'upload :", uploadError);
    setUploadMessage("Erreur lors de l'envoi du fichier.");
    return;
  }

  const filePath = upload.path;
  const url = supabase.storage.from("factures").getPublicUrl(filePath).data.publicUrl;

  const { error } = await supabase.from("garanties").insert({
    nom,
    date_achat,
    duree_mois,
    date_fin,
    user_id: userId,
    facture_url: url,
  });

  if (error) {
    setUploadMessage("❌ Erreur lors de l'enregistrement.");
  } else {
    setUploadMessage("✅ Garantie enregistrée !");
    setEditorGarantie(null);
    setUploadFile(null);
    fetchGaranties(userId);
  }
};
if (isLoading) {
  return <div className="p-4 text-black">Chargement...</div>;
}

return (
  <div className="min-h-screen flex flex-col bg-white pb-32">
    <div className="p-4">
      <h1 className="text-xl font-bold">Mes Garanties</h1>
      <input
        type="text"
        placeholder="Rechercher une garantie..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="border mt-2 p-2 rounded-lg text-sm w-full"
      />
    </div>

    <div className="flex flex-col gap-4 px-4 pb-40">
      {garanties
        .filter((g) => g.nom.toLowerCase().includes(recherche.toLowerCase()))
        .map((g) => (
          <div
            key={g.id}
            className="p-4 bg-gray-100 rounded-xl shadow cursor-pointer"
            onClick={() =>
              setGarantieOuverteId(garantieOuverteId === g.id ? null : g.id!)
            }
          >
            <h2 className="font-semibold">{g.nom}</h2>
            <p className="text-sm text-black">
              Achat : {g.date_achat} | Fin : {g.date_fin} ({g.duree_mois} mois)
            </p>

            {garantieOuverteId === g.id && (
              <div className="mt-3 space-y-2">
                {g.facture_url ? (
                  <Link href={g.facture_url} passHref legacyBehavior>
  <a
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="w-full max-h-64 relative rounded border overflow-hidden cursor-zoom-in hover:opacity-90 transition">
      <Image
        src={g.facture_url}
        alt="Facture"
        layout="fill"
        objectFit="contain"
      />
    </div>
  </a>
</Link>
                ) : (
                  <p className="text-black text-sm">Aucune facture liée.</p>
                )}
                <button
                  onClick={() => supprimerGarantie(g.id!)}
                  className="text-red-500 text-sm mt-1"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
    </div>

    <div className="fixed bottom-24 left-0 right-0 px-4">
      <button
        onClick={() => setFormVisible(!formVisible)}
        className="w-full bg-blue-600 text-white py-2 rounded-xl shadow font-medium"
      >
        {formVisible ? "Fermer le formulaire" : "Ajouter manuellement"}
      </button>

      {formVisible && (
        <div className="mt-4 bg-white border p-4 rounded-xl shadow">
          {erreur && <p className="text-red-500 text-sm mb-2">{erreur}</p>}
          <input
            type="text"
            placeholder="Nom du produit"
            value={nomProduit}
            onChange={(e) => setNomProduit(e.target.value)}
            className="border p-2 rounded-lg text-sm mb-2 w-full"
          />
          <label className="block text-sm text-black mb-1">
            Date d’achat :
            <input
              type="date"
              value={dateAchat}
              onChange={(e) => setDateAchat(e.target.value)}
              className="border p-2 rounded-lg text-sm mt-1 w-full"
            />
          </label>
          <input
            type="number"
            placeholder="Durée de garantie (mois)"
            value={dureeMois}
            onChange={(e) => setDureeMois(Number(e.target.value))}
            className="border p-2 rounded-lg text-sm mb-2 w-full"
            min={1}
          />
          <button
            onClick={ajouterGarantie}
            className="bg-blue-600 text-white w-full py-2 rounded-lg font-medium"
          >
            Ajouter
          </button>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={() => setOcrVisible(!ocrVisible)}
          className="w-full bg-blue-600 text-white py-2 rounded-xl shadow font-medium"
        >
          {ocrVisible ? "Fermer l'import de facture" : "Importer une facture"}
        </button>

        {ocrVisible && (
          <div className="mt-3 bg-white border p-4 rounded-xl shadow">
            <input
              type="file"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
              className="border p-2 mb-2 w-full"
            />
            {uploadMessage && (
              <div className="text-sm text-center py-1 animate-pulse text-blue-700">
                {uploadMessage}
              </div>
            )}

            {editorGarantie && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Garantie extraite :</h3>
                <input
                  type="text"
                  value={editorGarantie.nom}
                  onChange={(e) =>
                    setEditorGarantie({ ...editorGarantie, nom: e.target.value })
                  }
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Nom du produit"
                />
                <input
                  type="date"
                  value={editorGarantie.date_achat}
                  onChange={(e) =>
                    setEditorGarantie({
                      ...editorGarantie,
                      date_achat: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full mb-2"
                />
                <input
                  type="number"
                  value={editorGarantie.duree_mois}
                  onChange={(e) =>
                    setEditorGarantie({
                      ...editorGarantie,
                      duree_mois: parseInt(e.target.value),
                    })
                  }
                  className="border p-2 rounded w-full mb-2"
                  placeholder="Durée (mois)"
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full"
                  onClick={validerGarantieOCR}
                >
                  Valider cette garantie
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm flex justify-around py-2 z-50">
  <Link href="/dashboard">
    <span className="text-sm text-blue-600 font-medium">Garanties</span>
  </Link>
  <Link href="/reminders">
    <span className="text-sm text-black">Rappels</span>
  </Link>
  <Link href="/profile">
    <span className="text-sm text-black">Profil</span>
  </Link>
</nav>
  </div>
);
}