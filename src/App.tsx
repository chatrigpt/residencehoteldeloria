import { useState, useEffect } from "react";
import { MenuData } from "./types";
import MenuPublic from "./components/MenuPublic";
import AdminPanel from "./components/AdminPanel";
import Toast from "./components/Toast";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import defaultMenuData from "../menu.json";
import { db, doc, getDoc, setDoc } from "./lib/firebase";

export default function App() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [view, setView] = useState<"menu" | "admin">("menu");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null);


  // Monitor location hashes safely to activate #admin
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#admin" || window.location.pathname.endsWith("/admin")) {
        setView("admin");
      } else {
        setView("menu");
      }
    };

    // Initial check
    handleHashChange();

    // Listeners
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Fetch Menu from Firestore database
  const fetchMenu = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "menus", "default");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as MenuData;
        setMenuData(data);
        localStorage.setItem("deloria_menu_cache", JSON.stringify(data));
      } else {
        // First boot: setup standard initial catalog
        await setDoc(docRef, defaultMenuData);
        setMenuData(defaultMenuData as MenuData);
        localStorage.setItem("deloria_menu_cache", JSON.stringify(defaultMenuData));
      }
    } catch (err: any) {
      console.warn("Could not load from Firebase, reading from cache/file fallback:", err);
      const cached = localStorage.getItem("deloria_menu_cache");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setMenuData(parsed);
          handleShowToast("Catalogue chargé depuis la mémoire locale.", "info");
        } catch {
          setMenuData(defaultMenuData as MenuData);
        }
      } else {
        setMenuData(defaultMenuData as MenuData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Handle Save Menu on backend (Firestore document write)
  const handleSaveMenu = async (newMenu: MenuData): Promise<boolean> => {
    try {
      // Keep state and local storage immediately in sync
      localStorage.setItem("deloria_menu_cache", JSON.stringify(newMenu));
      setMenuData(newMenu);

      const docRef = doc(db, "menus", "default");
      await setDoc(docRef, newMenu);
      handleShowToast("Modifications enregistrées et publiées pour tous !", "success");
      return true;
    } catch (err) {
      console.warn("Could not save to Firestore, saved only locally:", err);
      handleShowToast("Enregistré localement (erreur de connexion réseau).", "info");
      return true;
    }
  };

  const handleShowToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  const handleGoToAdmin = () => {
    window.location.hash = "#admin";
    setView("admin");
  };

  const handleGoToMenu = () => {
    window.location.hash = "";
    setView("menu");
  };

  // ----- LOADING SCREEN AND PLACARDS -----
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brown-dark to-black text-gold">
        <div className="relative flex flex-col items-center">
          {/* Animated Spinner with Deloria theme colors */}
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
          <Sparkles className="w-6 h-6 text-gold animate-bounce absolute top-5 text-center" />
          
          <h2 className="font-serif font-bold text-sm tracking-widest uppercase">Chargement du catalogue...</h2>
          <p className="text-[10px] text-gold-light/60 tracking-wider font-semibold uppercase mt-1">Restaurant Deloria</p>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cream to-cream-dark">
        <div className="w-full max-w-md bg-white border border-rose-200 shadow-2xl rounded-3xl p-8 text-center space-y-5">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-sans font-bold text-base text-brown">Problème de connexion</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {error || "Une erreur s'est produite lors du chargement des informations."}
          </p>
          <button
            onClick={fetchMenu}
            className="w-full py-3 rounded-xl bg-gold hover:bg-gold-light text-brown-dark font-sans font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
            Réessayer de charger
          </button>
        </div>
      </div>
    );
  }

  // ----- MAIN VIEW HANDLERS SPLICER -----
  return (
    <div className="min-h-screen">
      {/* Dynamic Toast System */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {view === "admin" ? (
        <AdminPanel
          initialMenu={menuData}
          onSaveMenu={handleSaveMenu}
          onCloseAdmin={handleGoToMenu}
          onShowToast={handleShowToast}
        />
      ) : (
        <MenuPublic 
          categories={menuData.categories} 
          onOpenAdmin={handleGoToAdmin} 
        />
      )}
    </div>
  );
}
