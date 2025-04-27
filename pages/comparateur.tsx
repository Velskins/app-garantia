// pages/comparateur.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import nav1 from "@/assets/images/nav/nav1.png";
import nav2 from "@/assets/images/nav/nav2.png";
import nav3 from "@/assets/images/nav/nav3.png";
import nav4 from "@/assets/images/nav/nav4.png";

export default function Comparateur() {
  const [notify, setNotify] = useState(false);
  const { pathname } = useRouter();
  const [ajoutVisible, setAjoutVisible] = useState(false);


  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="p-4">
        {/* 1. En-tête */}
        <h1 className="text-3xl font-semibold underline decoration-4 decoration-black underline-offset-2 mb-6">
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
            {/* Remplacez ce placeholder par votre table HTML ou une image */}
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
          Nous construisons une fonctionnalité inédite pour vous aider à
          choisir vos produits selon ce qui compte vraiment : leur durée de vie,
          leur couverture, et les conditions de garantie.
        </p>

        {/* 5. Toggle “Me prévenir dès que disponible” */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-gray-900">
            ME PRÉVENIR DÈS QUE DISPONIBLE
          </span>
          <button
            type="button"
            aria-pressed={notify}
            onClick={() => setNotify((v) => !v)}
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

        {/* 6. Bouton principal */}
      </div>
      <button
  onClick={() => setAjoutVisible(true)}
className="fixed bottom-21 left-10 right-10
    bg-black text-white py-3 text-center font-medium z-40
  "
>
J&apos;ajoute une garantie
</button>
      <nav className="fixed bottom-5 left-10 right-10 shadow-t flex items-center z-50">
  {/* Dashboard */}
  <Link
    href="/dashboard"
    className="flex-1 flex justify-center items-center"
  >
      <Image src={nav1} alt="Garanties" width={30} height={30} />
  </Link>

  {/* Rappels */}
  <Link href="/reminders" className="flex-1 flex justify-center items-center">
    <Image src={nav2} alt="Rappels" width={30} height={30} />
  </Link>

  {/* Ajouter */}
  <Link href="/comparateur" className="flex-1 flex justify-center items-center">
  <div
      className={`
        py-4 px-6 
        ${pathname === "/comparateur"
          ? "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-200"
          : ""}
      `}
    >
    <Image src={nav3} alt="Ajouter" width={45} height={45} />
    </div>
  </Link>

  {/* Profil */}
  <Link href="/profile" className="flex-1 flex justify-center items-center">
    <Image src={nav4} alt="Profil" width={30} height={30} />
  </Link>
</nav>
    </div>
  );
}