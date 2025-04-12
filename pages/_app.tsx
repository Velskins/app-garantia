import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        if (router.pathname !== "/auth" && router.pathname !== "/signup") {
          router.replace("/auth");
        }
      }

      setCheckingSession(false);
    };

    checkInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        if (router.pathname !== "/auth" && router.pathname !== "/signup") {
          router.replace("/auth");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Chargement...
      </div>
    );
  }

  return <Component {...pageProps} />;
}