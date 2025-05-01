import Image from "next/image"
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import nav1 from "@/assets/images/nav/nav1.png";
import nav2 from "@/assets/images/nav/nav2.png";
import nav3 from "@/assets/images/nav/nav3.png";
import nav4 from "@/assets/images/nav/nav4.png";

interface Garantie {
  id: string;
  nom: string;
  date_fin: string;
  expired?: boolean;
}

export default function Profile() {
  const router = useRouter();
  const [email] = useState("");
  const { pathname } = useRouter();
  const [message] = useState<string>("");



  useEffect(() => {
    const fetchExpired = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
  
      if (!session) {
        router.replace("/auth");
        return;
      }
  
    };
  
    fetchExpired();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-24">
      <div className="p-4">
      <h1 className="text-4xl font-semibold underline decoration-4 decoration-black underline-offset-2 mb-4">
      Mon profil
      </h1>
      <p className="text-sm text-gray-700 mb-4">
  Connecté en tant que : <span className="font-semibold">{email || "Chargement…"}</span>
</p>
      </div>

      <div className="px-4 space-y-4">
  {/* 1. Modifier mon profil */}
  <Link href="/profile/edit">
    <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-3xl mb-5">
      <span className="text-base font-black underline">Modifier mon profil</span>
      <ChevronRight className="w-5 h-5 text-gray-900" />
    </div>
  </Link>

  {/* 2. Garanties expirées */}
  <Link href="/expired">
    <div className="flex justify-between items-center p-4 bg-pink-50 rounded-3xl mb-5">
      <span className="text-base font-black underline">Garanties expirées</span>
      <ChevronRight className="w-5 h-5 text-gray-900" />
    </div>
  </Link>

  {/* 3. Paramètres */}
  <Link href="/settings">
    <div className="flex justify-between items-center p-4 bg-green-50 rounded-3xl mb-5">
      <span className="text-base font-black underline">Paramètres</span>
      <ChevronRight className="w-5 h-5 text-gray-900" />
    </div>
  </Link>

  {/* 4. Alertes */}
  <Link href="/reminders">
    <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-3xl mb-5">
      <span className="text-base font-black underline">Alertes</span>
      <ChevronRight className="w-5 h-5 text-gray-900" />
    </div>
  </Link>

  {/* 5. Se déconnecter */}
  <button onClick={async () => { await supabase.auth.signOut(); router.replace("/auth"); }} className="w-full">
    <div className="flex justify-between items-center p-4 bg-gray-200 rounded-3xl">
      <span className="text-base font-black underline">Se déconnecter</span>
      <ChevronRight className="w-5 h-5 text-gray-900" />
    </div>
  </button>
  {message && (
  <p className="text-sm text-red-500 mb-4">
    {message}
  </p>
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
  className="fixed bottom-21 left-10 right-10
    bg-black text-white py-3 text-center font-medium z-40"
>
  J&apos;ajoute une garantie
</button>

</div>
 </div>

  {/* Dashboard */}
  <Link
    href="/dashboard"
    className="w-1/4 flex-1 flex justify-center items-center"
  >

      <Image src={nav1} alt="Garanties" width={30} height={30} />
  </Link>

  {/* Rappels */}
  <Link href="/reminders" className="w-1/4 flex-1 flex justify-center items-center">
    <Image src={nav2} alt="Rappels" width={30} height={30} />
  </Link>

  {/* Ajouter */}
  <Link href="/comparateur" className="w-1/4 flex-1 flex justify-center items-center">
    <Image src={nav3} alt="Ajouter" width={45} height={45} />
  </Link>

  {/* Profil */}
  <Link href="/profile" className="w-1/4 flex-1 flex justify-center items-center">
  <div
      className={`
        py-4 px-6 rounded-br-xl
        ${pathname === "/profile"
          ? "bg-gradient-to-br from-pink-300 via-red-200 to-yellow-200"
          : ""}
      `}
    >
    <Image src={nav4} alt="Profil" width={40} height={40} />
    </div>
  </Link>
</nav>
</div>

    </div>
  );
}