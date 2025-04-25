// pages/loading.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "@/assets/images/loading_page/logo_garantia.png"

export default function Loading() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 3000); // 3s avant la redirection
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center"
        >
          {/* Logo */}
          <Image
  src={logo}
  alt="Logo Garant'IA"
  width={120}
  height={120}
/>

          {/* Texte, démarré invisible et décalé */}
          <motion.span
            initial={{ scale: 1.5, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
            className="ml-4 text-3xl font-semibold select-none"
          >
            Garant’IA
          </motion.span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}