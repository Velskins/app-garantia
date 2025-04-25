import Image from "next/image"
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import { Search, Filter } from "lucide-react";
import { ChevronRight, Hourglass } from "lucide-react";
import { Cpu, DollarSign, Car } from "lucide-react";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import nav1 from "@/assets/images/nav/nav1.png";
import nav2 from "@/assets/images/nav/nav2.png";
import nav3 from "@/assets/images/nav/nav3.png";
import nav4 from "@/assets/images/nav/nav4.png";



interface Garantie {
  id?: string;
  marque: string;
  produit: string;
  date_achat: string;
  date_fin: string;
  duree_mois: number;
  facture_url?: string | null;
  expired?: boolean;
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
  const [nomMarque, setNomMarque]   = useState<string>("");
  const [dateAchat, setDateAchat] = useState("");
  const [dureeMois, setDureeMois] = useState<number | "">("");
  const [erreur, setErreur] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [marque]     = useState<string>("");  
  const [produit]   = useState<string>("");
  const [editorGarantie, setEditorGarantie] = useState<Garantie | null>(null);
  const { pathname } = useRouter();
  const [formVisible, setFormVisible] = useState(false);
  const [ocrVisible, setOcrVisible]   = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);

  

  const fetchGaranties = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("garanties")
      .select("id, marque, produit, date_achat, date_fin, duree_mois, facture_url, expired")
      .eq("user_id", uid)
      .order("date_achat", { ascending: false });
  
    if (error) {
      console.error("Erreur fetchGaranties :", error);
      return;
    }
    await updateExpiredGaranties(data as Garantie[]);
    setGaranties((data as Garantie[]).filter((g) => !g.expired));
  }, []);
  
  // 2) useEffect qui inclut désormais fetchGaranties
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
  }, [router, fetchGaranties]);

  const updateExpiredGaranties = async (data: Garantie[]) => {
    const aujourdHui = new Date();
  
    const promises = data.map(async (g) => {
      const dateFin = new Date(g.date_fin);
      if (!g.expired && dateFin < aujourdHui) {
        await supabase
          .from("garanties")
          .update({ expired: true })
          .eq("id", g.id);
      }
    });
  
    await Promise.all(promises);
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
      user_id:   userId,
      marque:    nomMarque,
      produit:   nomProduit,
      date_achat: dateAchat,
      duree_mois: dureeMois,
      date_fin:   dateFin,
    });

  if (error) {
    setErreur("Erreur lors de l'ajout.");
  } else {
    // 1) Vider la marque
    setNomMarque("");
    // 2) Vider le nom du produit
    setNomProduit("");
    // 3) Vider la date d'achat
    setDateAchat("");
    // 4) Remettre la durée à 0 (type number)
    setDureeMois(0);
    // 5) Réinitialiser l'erreur
    setErreur("");
    // 6) Rafraîchir la liste
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
    marque,            // ta variable d’état
    produit,           // idem
    date_achat: dateAchat,
    duree_mois: duree,
    date_fin: "",      // ou calculée automatiquement
    facture_url: null,
    expired: false,
  });
};

const handleFileSelect = (file: File | null) => {
  setUploadFile(file);

  if (!file) return;

  setUploadMessage(`✅ ${file.name} prêt à être analysé.`);

  // Si le fichier est un PDF → conversion en image
  if (file.type === "application/pdf") {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      try {
        const typedarray = new Uint8Array(fileReader.result as ArrayBuffer);

        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        canvas.toBlob((blob) => {
          if (blob) {
            const imageFile = new File([blob], "page1.png", { type: "image/png" });
            lancerOCR(imageFile); // ← envoie à Tesseract
          } else {
            setUploadMessage("❌ Échec de la conversion PDF.");
          }
        }, "image/png");
      } catch (err) {
        console.error("Erreur lors du traitement du PDF :", err);
        setUploadMessage("❌ Erreur lors de la lecture du PDF.");
      }
    };

    fileReader.readAsArrayBuffer(file);
  } else {
    // Sinon, image classique
    lancerOCR(file);
  }
};

const validerGarantieOCR = async () => {
  if (!editorGarantie || !userId || !uploadFile) return;

  // 1) Récupérer les bons champs
  const { marque, produit, date_achat, duree_mois } = editorGarantie;

  // 2) Vérifier que tout est renseigné
  if (!marque || !produit || !date_achat || !duree_mois) {
    setUploadMessage("❌ Veuillez compléter tous les champs.");
    return;
  }

  // 3) Calculer date_fin
  const dateFinObj = new Date(date_achat);
  dateFinObj.setMonth(dateFinObj.getMonth() + Number(duree_mois));
  const date_fin = dateFinObj.toISOString().split("T")[0];

  setUploadMessage("📤 Upload vers Supabase lancé...");
  setIsLoading(true);

  // 4) Uploader le fichier
  const { data: upload, error: uploadError } = await supabase.storage
    .from("factures")
    .upload(
      `${userId}/${Date.now()}_${uploadFile.name}`,
      uploadFile,
      { cacheControl: "3600", upsert: false }
    );

  if (uploadError) {
    console.error("❌ Échec de l'upload :", uploadError);
    setUploadMessage("❌ Erreur lors de l'envoi du fichier.");
    setIsLoading(false);
    return;
  }

  // 5) Récupérer l’URL publique
  const filePath = upload.path;
  const { data: { publicUrl: url } } = supabase
    .storage
    .from("factures")
    .getPublicUrl(filePath);

  // 6) Insérer la garantie en base
  const { error } = await supabase
    .from("garanties")
    .insert({
      marque,
      produit,
      date_achat,
      duree_mois,
      date_fin,
      user_id: userId,
      facture_url: url,
    });

  if (error) {
    console.error("❌ Erreur insert:", error);
    setUploadMessage("❌ Erreur lors de l'enregistrement.");
  } else {
    setUploadMessage("✅ Garantie enregistrée !");
    setEditorGarantie(null);
    setUploadFile(null);
    fetchGaranties(userId);
  }

  setIsLoading(false);
};

// Enfin, si tu veux afficher un loader pendant l’upload :
if (isLoading) {
  return <div className="p-4 text-neutral-700">Chargement...</div>;
}

return (
  <div className="min-h-screen flex flex-col bg-white pb-32">
    <div className="p-4">
    <h1 className="text-3xl font-semibold underline decoration-4 decoration-black underline-offset-2 mb-6">
  Mes garanties
</h1>
<div className="flex items-center mb-6">
  {/* barre de recherche noire */}
  <div className="flex items-center bg-black rounded-br-xl px-4 h-12 flex-grow">
    <input
      type="text"
      placeholder="Rechercher une garantie…"
      className="flex-grow bg-transparent placeholder-white text-white text-lg focus:outline-none"
    />
    <Search className="w-7 h-7 text-white ml-3" />
  </div>

  {/* bouton filtre aligné */}
  <button className="ml-4 p-2 h-12 flex items-center">
    <Filter className="w-5 h-5 text-black" />
  </button>
</div>
</div>

{/* …dans ton return() de dashboard.tsx… */}
{/* …dans ton return() de dashboard.tsx… */}
<div className="flex-1 overflow-y-auto px-4 pb-4">
  {garanties.map((g, i) => {
    // Palette pastel cyclique
    const palette = [
      { bg: "bg-pink-50",   fg: "text-pink-600",   Icon: Cpu        },
      { bg: "bg-green-50",  fg: "text-green-600",  Icon: DollarSign},
      { bg: "bg-indigo-50", fg: "text-indigo-600", Icon: Car        },
    ];
    const { bg, fg, Icon } = palette[i % palette.length];

    return (
      <div key={g.id} className="mb-4">
        <div className="flex items-center justify-between">
          {/* Icône + infos */}
          <div className="flex items-center">
            <div className={`${bg} p-5 rounded-xl mr-4`}>
              <Icon className={`w-10 h-10 ${fg}`} />
            </div>
            <div>
              {/* 1. Marque */}
              <p className="text-base font-black uppercase text-gray-900">
                {g.marque}
              </p>

              {/* 2. Nom du produit */}
              <p className="text-sm font-medium text-gray-700 leading-tight mt-1">
                {g.produit}
              </p>

              {/* Dates */}
              <div className="mt-1 flex flex-col space-y-1 text-sm text-blue-600">
                <p>Acheté : {g.date_achat}</p>
                <p>Expire : {g.date_fin}</p>
              </div>

              {/* Durée */}
              <p className="flex items-center text-xs font-bold text-red-500 mt-1">
                <Hourglass className="w-4 h-4 mr-1" />
                {g.duree_mois} mois
              </p>
            </div>
          </div>

          {/* Voir plus */}
          <button className="flex flex-col items-center text-gray-900 font-medium">
            <ChevronRight className="w-5 h-5" />
            <span className="underline ml-1 text-sm">Voir plus</span>
          </button>
        </div>

        {/* Séparateur */}
        <hr className="border-t border-gray-200 mt-4" />
      </div>
    );
  })}
</div>

    <div className="fixed bottom-24 left-0 right-0 px-4">
      {/* <button
        onClick={() => setFormVisible(!formVisible)}
        className="w-full bg-blue-600 text-white py-2 rounded-xl shadow font-medium"
      >
        {formVisible ? "Fermer le formulaire" : "Ajouter manuellement"}
      </button> */}

      {formVisible && (
        <div className="mt-4 bg-white border p-4 rounded-xl shadow">
          {erreur && <p className="text-red-500 text-sm mb-2">{erreur}</p>}
          <input
          type="text"
          placeholder="Marque"
          value={nomMarque}
          onChange={(e) => setNomMarque(e.target.value)}
          className="border p-2 rounded-lg text-sm mb-2 w-full"
          />
          <input
            type="text"
            placeholder="Nom du produit"
            value={nomProduit}
            onChange={(e) => setNomProduit(e.target.value)}
            className="border p-2 rounded-lg text-sm mb-2 w-full"
          />
          <label className="block text-sm text-black text-neutral-900 mb-1">
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
        {/* Bouton fixe "J'ajoute ma garantie" */}
{/* Bouton principal fixe */}
<button
  onClick={() => setAjoutVisible(true)}
className="fixed bottom-21 left-10 right-10
    bg-black text-white py-3 text-center font-medium z-40
  "
>
J&apos;ajoute une garantie
</button>
{ajoutVisible && (
  <div className="fixed inset-0 bg-black/50 flex items-end z-50">
    <div className="bg-white w-full rounded-t-2xl p-4 space-y-2">
      <button
        onClick={() => {
          setFormVisible(true);
          setAjoutVisible(false);
        }}
        className="w-full py-3 bg-gray-100 rounded-lg text-gray-800 font-medium"
      >
        Ajout manuel
      </button>
      <button
        onClick={() => {
          setOcrVisible(true);
          setAjoutVisible(false);
        }}
        className="w-full py-3 bg-gray-100 rounded-lg text-gray-800 font-medium"
      >
        Import de facture
      </button>
      <button
        disabled
        className="w-full py-3 bg-gray-100 rounded-lg text-gray-400 font-medium cursor-not-allowed"
      >
        Caméra (bientôt dispo)
      </button>
      <button
        onClick={() => setAjoutVisible(false)}
        className="w-full py-3 text-red-500 font-medium"
      >
        Annuler
      </button>
    </div>
  </div>
)}
        {/* <button
          onClick={() => setOcrVisible(!ocrVisible)}
          className="w-full bg-blue-600 text-white py-2 rounded-xl shadow font-medium"
        >
          {ocrVisible ? "Fermer l'import de facture" : "Importer une facture"}
        </button> */}

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

    {/* Champ Marque */}
    <input
      type="text"
      value={editorGarantie.marque}
      onChange={(e) =>
        setEditorGarantie({ ...editorGarantie, marque: e.target.value })
      }
      className="border p-2 rounded w-full mb-2"
      placeholder="Marque"
    />

    {/* Champ Nom du produit */}
    <input
      type="text"
      value={editorGarantie.produit}
      onChange={(e) =>
        setEditorGarantie({ ...editorGarantie, produit: e.target.value })
      }
      className="border p-2 rounded w-full mb-2"
      placeholder="Nom du produit"
    />

    {/* Champ Date d'achat */}
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

    {/* Champ Durée (mois) */}
    <input
      type="number"
      value={editorGarantie.duree_mois}
      onChange={(e) =>
        setEditorGarantie({
          ...editorGarantie,
          duree_mois: parseInt(e.target.value, 10) || 0,
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
      <div className="mt-4">
  {/* <button
    disabled
    className="w-full bg-gray-300 text-gray-600 py-2 rounded-xl shadow font-medium cursor-not-allowed"
  >
    Caméra (bientôt dispo)
  </button> */}
</div>
    </div>

    <nav className="fixed bottom-5 left-10 right-10 shadow-t flex items-center z-50">
  {/* Dashboard */}
  <Link
    href="/dashboard"
    className="flex-1 flex justify-center items-center"
  >
    <div
      className={`
        py-4 px-6 rounded-bl-xl
        ${pathname === "/dashboard"
          ? "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-200"
          : ""}
      `}
    >
      <Image src={nav1} alt="Garanties" width={30} height={30} />
    </div>
  </Link>

  {/* Rappels */}
  <Link href="/reminders" className="flex-1 flex justify-center items-center">
    <Image src={nav2} alt="Rappels" width={30} height={30} />
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