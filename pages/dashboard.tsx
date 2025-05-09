import Image from "next/image"
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";
import { Search, Filter } from "lucide-react";
import {Hourglass } from "lucide-react";
import { Camera, FileText, Edit3 } from "lucide-react";
import { Cpu, DollarSign, Car } from "lucide-react";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import nav1 from "@/assets/images/nav_image/nav_dashboard.png";
import nav2 from "@/assets/images/nav_image/nav_reminders.png";
import nav3 from "@/assets/images/nav_image/nav_comp.png";
import nav4 from "@/assets/images/nav_image/nav_profile.png";
import fleche from"@/assets/images/base/fleche.png";



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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [editorGarantie, setEditorGarantie] = useState<Garantie | null>(null);
  const { pathname } = useRouter();
  const [formVisible, setFormVisible] = useState(false);
  const [ocrVisible, setOcrVisible] = useState(false);
  const [ajoutVisible, setAjoutVisible] = useState(false);
  const [recherche, setRecherche] = useState<string>("");

  const [categories] = useState<string[]>([
    "Électroménager",
    "Électronique grand public",
    "Informatique & bureautique",
    "Jardinage & plein air",
    "Bricolage & outillage",
    "Mobilier & décoration",
    "Cuisine & arts de la table",
    "Automobile & moto",
    "Sports & loisirs",
    "Santé & bien-être",
    "Montres & bijoux",
    "Bébés & enfants",
    "Photographie & vidéo",
    "Outils professionnels",
    "Autres",
  ]);

  // pour manuel
const [nouvelleGarantie, setNouvelleGarantie] = useState<{
  marque: string;
  produit: string;
  categorie: string;
  date_achat: string;
  duree_mois: string;
}>({
  marque: "",
  produit: "",
  categorie: "",
  date_achat: "",
  duree_mois: "",
});

const handleAddManuel = async () => {
  const { marque, produit, categorie, date_achat, duree_mois } = nouvelleGarantie;

  // Validation
  if (!marque || !produit || !categorie || !date_achat || !duree_mois) {
    // tu peux afficher une erreur ici, ex. setErreur("…")
    return;
  }

  // Calcul de la date de fin
  const dateFinObj = new Date(date_achat);
  dateFinObj.setMonth(dateFinObj.getMonth() + Number(duree_mois));
  const date_fin = dateFinObj.toISOString().split("T")[0];

  // Envoi à Supabase
  const { error } = await supabase
    .from("garanties")
    .insert({
      user_id: userId,
      marque,
      produit,
      categorie,
      date_achat,
      duree_mois: Number(duree_mois),
      date_fin,
      facture_url: null,
    });

  if (error) {
    console.error("Erreur ajout manuel :", error);
    // setErreur("Erreur lors de l'ajout.");
  } else {
    // Réinitialise le form
    setNouvelleGarantie({
      marque: "",
      produit: "",
      categorie: "",
      date_achat: "",
      duree_mois: "",
    });
    setFormVisible(false);
    fetchGaranties(userId!);
  }
};

  

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

if (isLoading) {
  return (
    <div className="p-4 text-neutral-700">
      Chargement...
    </div>
  );
}

return (
  <div className="min-h-screen flex flex-col bg-white pb-32">
    <div className="p-10">
    <h1 className="text-4xl font-bold underline decoration-4 decoration-black underline-offset-2 mb-4">
  Mes garanties
</h1>
{/* Barre de recherche + filtre */}
<div className="flex items-center mb-6">
  <div className="flex items-center bg-black rounded-br-xl px-4 h-12 flex-grow">
    <input
      type="text"
      placeholder="Rechercher une garantie…"
      value={recherche}
      onChange={(e) => setRecherche(e.target.value)}
      className="flex-grow bg-transparent placeholder-white text-white text-sm focus:outline-none"
    />
    <Search className="w-5 h-5 text-white ml-3" />
  </div>
  <button className="ml-4 p-2 h-12 flex items-center">
    <Filter className="w-5 h-5 text-black" />
  </button>
</div>

{/* Liste filtrée des garanties */}
<div className="flex-1 overflow-y-auto pb-4 space-y-4">
  {garanties
    .filter((g) =>
      g.marque.toLowerCase().includes(recherche.toLowerCase()) ||
      g.produit.toLowerCase().includes(recherche.toLowerCase())
    )
    .map((g, i) => {
      const palette = [
        { bg: "bg-pink-50",   fg: "text-pink-600",   Icon: Cpu       },
        { bg: "bg-green-50",  fg: "text-green-600",  Icon: DollarSign },
        { bg: "bg-indigo-50", fg: "text-indigo-600", Icon: Car       },
      ];
      const { bg, fg, Icon } = palette[i % palette.length];

      return (
        <div key={g.id} className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${bg} flex items-center justify-center p-3 rounded-xl mr-4 w-[90px] h-[80px]`}>
                <Icon className={`w-[36px] h-[37px] ${fg}`} />
              </div>
              <div className="flex-1 flex flex-col">
                <p className="text-base font-black uppercase text-gray-900">
                  {g.marque}
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {g.produit}
                </p>
                <div className="mt-1 flex flex-col space-y-1 text-sm text-blue-600">
                  <p>Acheté : {g.date_achat}</p>
                  <p>Expire : {g.date_fin}</p>
                </div>
                <p className="flex items-center text-xs text-gray-500 mt-1">
                  <Hourglass className="w-4 h-4 mr-1" />
                  {g.duree_mois} mois
                </p>
              </div>
            </div>
            <Link
              href={`/garantie/${g.id}`}
              className="flex flex-col items-center text-gray-900 font-medium">
              <Image
                src={fleche}       // ou un chemin public, ex: "/assets/icons/arrow-right.png"
                alt="Voir plus"
                width={20}
                height={20} />
              <span className="underline mt-1 text-sm">Voir plus</span>
            </Link>
          </div>
          <hr className="border-t border-gray-200 mt-4" />
        </div>
      );
    })}
</div>
</div>

{/* …dans ton return() de dashboard.tsx… */}
{/* …dans ton return() de dashboard.tsx… */}
<div
  style={{ background: "linear-gradient(to top, white 75%, transparent 100%)" }}
  className="fixed bottom-0 left-0 right-0 h-60 px-4 flex items-center justify-between"
>
    <div className="fixed bottom-24 left-0 right-0 px-4">


{formVisible && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black/30"
      onClick={() => setFormVisible(false)}
    />
    <div
      className="relative w-full max-w-md bg-white p-6 rounded-2xl border-[10px] border-[#E1FFF3]"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-4">Ajouter manuellement</h3>

      <input
        type="text"
        value={nouvelleGarantie.marque}
        onChange={(e) =>
          setNouvelleGarantie({ ...nouvelleGarantie, marque: e.target.value })
        }
        placeholder="Marque"
        className="w-full border rounded p-2 mb-4"
      />

      <input
        type="text"
        value={nouvelleGarantie.produit}
        onChange={(e) =>
          setNouvelleGarantie({ ...nouvelleGarantie, produit: e.target.value })
        }
        placeholder="Produit"
        className="w-full border rounded p-2 mb-4"
      />

      <div className="mb-4">
        <label className="block text-m font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          value={nouvelleGarantie.categorie}
          onChange={(e) =>
            setNouvelleGarantie({
              ...nouvelleGarantie,
              categorie: e.target.value,
            })
          }
          className="w-full border rounded p-2"
        >
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <label className="block text-m font-medium text-gray-700 mb-1">
          Date d'achat
        </label>
      <input
        type="date"
        value={nouvelleGarantie.date_achat}
        onChange={(e) =>
          setNouvelleGarantie({
            ...nouvelleGarantie,
            date_achat: e.target.value,
          })
        }
        className="w-full border rounded p-2 mb-4"
      />

      <input
        type="number"
        value={nouvelleGarantie.duree_mois}
        onChange={(e) =>
          setNouvelleGarantie({
            ...nouvelleGarantie,
            duree_mois: e.target.value,
          })
        }
        placeholder="Durée (mois) de la garantie"
        className="w-full border rounded p-2 mb-6"
      />

      <div className="flex space-x-2">
        <button
          onClick={handleAddManuel}
          className="flex-1 bg-black text-white py-2 rounded-lg"
        >
          Ajouter
        </button>
        <button
          onClick={() => setFormVisible(false)}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}

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
              className="flex items-center w-full p-3 bg-[#FFF8E1] rounded-2xl mb-5"
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
              className="flex items-center w-full p-3 bg-[#E0E3FE] rounded-2xl mb-5"
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
              className="flex items-center w-full p-3 bg-[#E1FFF3] rounded-2xl mb-30"
            >
              <Edit3 className="w-5 h-5 mr-3 text-green-900" />
              <span className="font-medium text-green-900">
                Ajouter manuellement
              </span>
            </button>
          </div>
        </div>
      )}        {/* <button
          onClick={() => setOcrVisible(!ocrVisible)}
          className="w-full bg-blue-600 text-white py-2 rounded-xl shadow font-medium"
        >
          {ocrVisible ? "Fermer l'import de facture" : "Importer une facture"}
        </button> */}

{ocrVisible && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop cliquable pour fermer */}
    <div
      className="absolute inset-0 bg-black/30"
      onClick={() => setOcrVisible(false)}
    />

    {/* Contenu OCR en pop-up */}
    <div
      className="relative w-full max-w-md bg-white border p-4 rounded-2xl shadow"
      onClick={(e) => e.stopPropagation()}
    >
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full mb-2"
            onClick={validerGarantieOCR}
          >
            Valider cette garantie
          </button>

          <button
            className="w-full py-2 text-center text-gray-500 rounded hover:bg-gray-100"
            onClick={() => setOcrVisible(false)}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  </div>
)}

      </div>

  {/* Dashboard */}
  <Link
    href="/dashboard"
    className="w-1/4 flex justify-center items-center"
  >
    <div
      className={`
        w-full h-full flex justify-center items-center
        py-4 rounded-bl-xl
        ${pathname === "/dashboard"
          ? "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-200"
          : ""}
      `}
    >
      <Image src={nav1} alt="Garanties" width={30} height={30} />
    </div>
  </Link>

  {/* Rappels */}
  <Link
    href="/reminders"
    className="w-1/4 flex justify-center items-center"
  >
    <div className="w-full h-full flex justify-center items-center py-4">
      <Image src={nav2} alt="Rappels" width={30} height={30} />
    </div>
  </Link>

  {/* Ajouter */}
  <Link
    href="/comparateur"
    className="w-1/4 flex justify-center items-center"
  >
    <div className="w-full h-full flex justify-center items-center py-4">
      <Image src={nav3} alt="Ajouter" width={45} height={45} />
    </div>
  </Link>

  {/* Profil */}
  <Link
    href="/profile"
    className="w-1/4 flex justify-center items-center"
  >
    <div className="w-full h-full flex justify-center items-center py-4">
      <Image src={nav4} alt="Profil" width={40} height={40} />
    </div>
  </Link>
</nav>

</div>

  </div>
);
}