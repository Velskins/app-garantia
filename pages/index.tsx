// pages/index.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (session) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    };

    checkSession();
  }, [router]);

  return null; // pas besoin d'afficher quoi que ce soit
}