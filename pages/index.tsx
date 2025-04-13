// pages/index.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">Bienvenue sur Garant-IA</h1>
      <p className="mb-6 text-lg">
        Gérez vos garanties facilement et automatiquement.
      </p>
      <Link href="/auth">
        <span className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
          Accéder à l’application
        </span>
      </Link>
    </div>
  );
}