import Header from "@/components/header";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AppLayout = ({ authEnabled = true }) => {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    let attempts = 0;
    const maxAttempts = 10; // ~1s total with 100ms interval
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        // center the element in the viewport
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        const offset = Math.max(0, (window.innerHeight - rect.height) / 2);
        const targetY = Math.max(0, absoluteTop - offset - 16); // slight 16px padding
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        return;
      }
      if (attempts++ < maxAttempts) setTimeout(tryScroll, 100);
    };
    // small initial delay to let route transition render
    setTimeout(tryScroll, 150);
  }, [location.pathname, location.hash]);
  return (
    <div>
      <div className="grid-background"></div>
      <main className="min-h-screen container scroll-smooth px-3 sm:px-0">
        <Header authEnabled={authEnabled} />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <div className="p-6 sm:p-10 text-center bg-gray-800 mt-10">
        Made with ❤️ by Anshuman
      </div>
    </div>
  );
};

export default AppLayout;
