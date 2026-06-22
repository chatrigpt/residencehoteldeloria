import React, { useState, useMemo } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  X, 
  Plus, 
  Minus, 
  Check, 
  Search, 
  Phone, 
  MapPin, 
  User, 
  Edit, 
  Clock, 
  Lock,
  Globe,
  Facebook,
  Share2,
  ArrowLeft,
  ShoppingBag
} from "lucide-react";
import { Category, Plat, CartItem, ClientInfo, LocalisationType } from "../types";
import CategoryIcon from "./CategoryIcon";

interface MenuPublicProps {
  categories: Category[];
  onOpenAdmin: () => void;
}

export default function MenuPublic({ categories, onOpenAdmin }: MenuPublicProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activePage, setActivePage] = useState<"portal" | "menu">("portal");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Customer Information States
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    nom: "",
    tel: "",
    localisation: "chambre",
    localisationDetail: ""
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [locationError, setLocationError] = useState("");

  const WHATSAPP_NUMBER = "2250709919293";

  // Filter categories and dishes according to user's search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories
      .map(cat => {
        const matchingPlats = cat.plats.filter(p =>
          p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...cat, plats: matchingPlats };
      })
      .filter(cat => cat.plats.length > 0);
  }, [categories, searchQuery]);

  // Cart Helper operations
  const handleToggleItem = (plat: Plat) => {
    if (!plat.disponible) return;
    const existingIndex = cart.findIndex(item => item.plat.id === plat.id);
    if (existingIndex > -1) {
      setCart(prev => prev.filter(item => item.plat.id !== plat.id));
    } else {
      setCart(prev => [...prev, { plat, qty: 1 }]);
    }
  };

  const handleChangeQty = (platId: string, delta: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent toggling selection
    setCart(prev =>
      prev.map(item => {
        if (item.plat.id === platId) {
          const newQty = Math.max(1, Math.min(99, item.qty + delta));
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const getPlatQty = (platId: string): number => {
    const item = cart.find(item => item.plat.id === platId);
    return item ? item.qty : 1;
  };

  const isPlatSelected = (platId: string): boolean => {
    return cart.some(item => item.plat.id === platId);
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.plat.prix * item.qty), 0);
  }, [cart]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const handleClearCart = () => {
    setCart([]);
    setOrderNotes("");
    setClientInfo({
      nom: "",
      tel: "",
      localisation: "chambre",
      localisationDetail: ""
    });
    setLocationError("");
    setIsCartOpen(false);
  };

  const selectLocalisation = (type: LocalisationType) => {
    setClientInfo(prev => ({
      ...prev,
      localisation: type,
      localisationDetail: type === "externe" ? "" : prev.localisationDetail
    }));
    setLocationError("");
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveCategory(id);
    }
  };

  const sendToWhatsApp = () => {
    if (cart.length === 0) return;

    // Localisation validation
    if (clientInfo.localisation !== "externe" && !clientInfo.localisationDetail.trim()) {
      const detailLabel = clientInfo.localisation === "chambre" ? "chambre" : "table";
      setLocationError(`Veuillez indiquer le numéro de ${detailLabel}.`);
      return;
    }

    setLocationError("");

    let message = "*COMMANDE — RESTAURANT DELORIA*\n\n";

    // Client Information Section
    if (clientInfo.nom.trim() || clientInfo.tel.trim()) {
      message += "*INFORMATIONS CLIENT*\n";
      if (clientInfo.nom.trim()) message += `• Nom : ${clientInfo.nom}\n`;
      if (clientInfo.tel.trim()) message += `• Téléphone : ${clientInfo.tel}\n`;
      message += "────────────────────────\n\n";
    }

    // Localisation Service Area
    message += "*LIEU DE SERVICE*\n";
    if (clientInfo.localisation === "externe") {
      message += "• Client Externe (À emporter / Hors-site)\n";
    } else {
      const locName = clientInfo.localisation === "chambre" ? "Chambre" : "Table";
      message += `• ${locName} N° : ${clientInfo.localisationDetail}\n`;
    }
    message += "────────────────────────\n\n";

    // Cart Items Listing
    message += "*DÉTAIL DE LA COMMANDE*\n";
    let hasVariablePricing = false;
    cart.forEach(item => {
      const isVariable = item.plat.prix === 0;
      if (isVariable) hasVariablePricing = true;
      const priceDisplay = isVariable ? "P.V.S.G / Sur commande" : `${(item.plat.prix * item.qty).toLocaleString()} FCFA`;
      message += `• *${item.plat.nom}*\n  Quantité : ${item.qty} × ${isVariable ? "Sur commande" : `${item.plat.prix.toLocaleString()} FCFA`} = ${priceDisplay}\n\n`;
    });

    message += "────────────────────────\n";
    if (cartTotal > 0) {
      message += `*TOTAL ESTIMÉ : ${cartTotal.toLocaleString()} FCFA*\n`;
    }
    if (hasVariablePricing) {
      message += "_(Note : Certains articles sont sur commande ou à tarif variable)_\n";
    }
    message += "\n";

    // Notes
    if (orderNotes.trim()) {
      message += `*Notes/Préférences :*\n"${orderNotes.trim()}"\n\n`;
    }

    message += "Merci de confirmer et de lancer la préparation !";

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (activePage === "portal") {
    return (
      <div className="min-h-screen bg-[#faf7ee] flex flex-col justify-between py-12 px-6 relative overflow-hidden font-sans">
        {/* Subtle patterned elegant ambiance */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(#b98d28 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Main portal layout */}
        <div className="flex justify-end max-w-md w-full mx-auto relative z-10">
          {/* Spacer to keep balance */}
          <div className="h-4" />
        </div>

        {/* Central Logo and Identity */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md w-full mx-auto relative z-10 my-8">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-[#b58c2c]/15 blur-xl rounded-full scale-110" />
            <img 
              src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/Capture%20d'%C3%A9cran%202026-05-20%20223523.png" 
              alt="Logo Deloria" 
              className="w-32 h-32 object-contain rounded-full bg-white p-2.5 shadow-xl relative border-2 border-[#b58c2c]/40"
            />
          </div>

          <h1 className="font-serif font-bold text-2xl tracking-[4px] uppercase text-[#4a3111] leading-tight drop-shadow-sm">
            RESTAURANT DELORIA
          </h1>
          <p className="font-serif italic text-xs tracking-widest text-[#90734c] uppercase mt-2">
            "Sentez-vous comme chez vous"
          </p>

          <div className="w-14 h-[2px] bg-gradient-to-r from-transparent via-[#b58c2c] to-transparent my-6" />

          {/* Core Interactive Portal Links List */}
          <div className="w-full space-y-4 max-w-sm">
            {/* 1. Passez une commande */}
            <button
              onClick={() => setActivePage("menu")}
              style={{
                background: "linear-gradient(135deg, #c9a227 0%, #a88420 100%)",
                boxShadow: "0 6px 20px rgba(201, 162, 39, 0.35)"
              }}
              className="w-full py-4 px-6 text-[#3d2410] font-sans font-bold text-sm tracking-wide uppercase rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-[2px] active:scale-98 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="#3d2410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Passez une commande</span>
            </button>

            {/* 2. Notez votre expérience */}
            <a
              href="https://share.google/MZVMKmlWd758tFkl9"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)",
                boxShadow: "0 6px 18px rgba(66, 133, 244, 0.3)"
              }}
              className="w-full py-4 px-6 text-white font-sans font-bold text-sm tracking-wide uppercase rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-[2px] active:scale-98 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Notez votre expérience</span>
            </a>

            {/* 3. Suivez-nous sur Facebook */}
            <a
              href="https://web.facebook.com/profile.php?id=100093182033714"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(135deg, #1877F2 0%, #166fe5 100%)",
                boxShadow: "0 6px 18px rgba(24, 119, 242, 0.3)"
              }}
              className="w-full py-4 px-6 text-white font-sans font-bold text-sm tracking-wide uppercase rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-[2px] active:scale-98 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Suivez-nous sur Facebook</span>
            </a>

            {/* 4. Suivez-nous sur TikTok */}
            <a
              href="https://www.tiktok.com/@rsidence.htel.del"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #333333 100%)",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)"
              }}
              className="w-full py-4 px-6 text-white font-sans font-bold text-sm tracking-wide uppercase rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-[2px] active:scale-98 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span>Suivez-nous sur TikTok</span>
            </a>

            {/* 5. Suivez-nous sur Instagram */}
            <a
              href="https://www.instagram.com/residencehoteldeloria?igsh=MXB4Znl4ZW4wbWxidQ=="
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 75%, #FCAF45 100%)",
                boxShadow: "0 6px 18px rgba(131, 58, 180, 0.3)"
              }}
              className="w-full py-4 px-6 text-white font-sans font-bold text-sm tracking-wide uppercase rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-[2px] active:scale-98 cursor-pointer"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
              <span>Suivez-nous sur Instagram</span>
            </a>

            {/* 6. Suivez-nous sur Threads */}
            <a
              href="https://www.threads.net/@residencehoteldeloria"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)"
              }}
              className="w-full py-4 px-6 text-white font-sans font-bold text-sm tracking-wide uppercase rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-[2px] active:scale-98 cursor-pointer border border-[#2c2c2c]"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.152 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-1.887 1.64-1.43 2.488-3.59 2.584-6.606l.02-.623-5.55-.024v-1.97h7.64l.016.698c-.02 2.724-.677 5.03-1.952 6.854-1.563 2.246-3.978 3.53-7.174 3.576z"/>
              </svg>
              <span>Suivez-nous sur Threads</span>
            </a>
          </div>
        </div>

        {/* Cozy Footer */}
        <div className="max-w-md w-full mx-auto text-center relative z-10 text-[10px] tracking-wide text-[#90734c]/70 font-semibold uppercase leading-relaxed flex flex-col items-center gap-3">
          <div>
            <p>Résidence Hôtel Deloria</p>
            <p className="text-[9px] text-[#90734c]/55 mt-1 font-normal lowercase">Arrah, quartier CGE — Côte d'Ivoire</p>
          </div>
          
          <button 
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#b58c2c]/5 hover:bg-[#b58c2c]/10 text-[#90734c]/40 hover:text-[#90734c] font-sans font-medium text-[9px] tracking-widest uppercase transition-all duration-300 rounded-full border border-transparent hover:border-[#b58c2c]/10 cursor-pointer mt-1"
          >
            <Lock className="w-2.5 h-2.5 opacity-50" />
            <span>Espace Resto</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-height-screen bg-[#FAF7EE]/50">
      {/* ===== HERO BRAND SPLASH HEADER ===== */}
      <header className="relative bg-gradient-to-br from-brown-dark via-brown to-amber-950 text-gold-light py-10 px-6 text-center overflow-hidden border-b-4 border-gold z-10 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-radial-gradient from-gold/10 via-transparent to-transparent pointer-events-none scale-150 animate-pulse duration-[6000ms]" />

        {/* Seamless Navigation back to Portal (Landing page) */}
        <button 
          onClick={() => setActivePage("portal")}
          className="absolute top-4 left-4 bg-black/35 hover:bg-black/50 text-gold-light hover:text-white px-3 py-1.5 rounded-full border border-gold/15 transition-all text-[10px] font-bold tracking-wider uppercase cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Accueil</span>
        </button>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Logo with double border aura */}
          <div className="mb-4 relative">
            <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-105" />
            <img 
              src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/Capture%20d'%C3%A9cran%202026-05-20%20223523.png" 
              alt="Logo Deloria" 
              className="w-24 h-24 object-contain rounded-full bg-white/90 p-2 shadow-2xl relative border-2 border-gold"
            />
          </div>

          <h1 className="font-serif font-bold text-2xl lg:text-3.5xl text-gold tracking-[3px] uppercase drop-shadow-lg leading-tight lg:leading-normal">
            RESTAURANT DELORIA
          </h1>
          <p className="font-serif italic text-xs lg:text-sm text-gold-light/95 tracking-widest mt-1">
            "Sentez-vous comme chez vous"
          </p>

          <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent my-4" />

          {/* Hotel Contact Grid Stacked as shown in Screenshot 2 - with Lucide icons (No Emojis) */}
          <div className="flex flex-col items-center gap-1 text-[11px] lg:text-xs text-gold-light/90 max-w-lg mt-1 font-medium select-none leading-relaxed">
            <div className="flex items-center gap-1.5 py-0.5 justify-center">
              <MapPin className="w-3.5 h-3.5 text-gold/85" />
              <span>Arrah, quartier CGE</span>
            </div>
            <div className="flex items-center gap-1.5 py-0.5 justify-center">
              <Phone className="w-3.5 h-3.5 text-gold/85" />
              <span>+225 07 09 91 92 93</span>
            </div>
            <div className="flex items-center gap-1.5 py-0.5 justify-center text-gold/90">
              <Globe className="w-3.5 h-3.5 text-gold/85" />
              <span>hoteldeloria@gmail.com</span>
            </div>
            <div className="flex items-center gap-1.5 py-0.5 justify-center text-gold-light/60">
              <Clock className="w-3.5 h-3.5 text-gold/85" />
              <span>Ouvert 7j/7 — 07h/23h</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== STICKY CATEGORIES SLIDER & SEARCH BAR ===== */}
      <div className="sticky top-0 z-40 bg-brown-dark shadow-xl border-b border-gold/30">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          {/* Horizon navigation menu */}
          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToSection(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-serif text-[10px] tracking-wider font-semibold uppercase transition-all whitespace-nowrap border cursor-pointer active:scale-95 ${
                    activeCategory === cat.id
                      ? "bg-gold border-gold text-brown-dark shadow-lg shadow-gold/20"
                      : "bg-brown/40 border-gold/20 text-gold-light hover:border-gold-light"
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                  <span>{cat.nom}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Admin shortcut button */}
          <button 
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:border-amber-400 text-amber-300 font-sans font-bold text-[10px] tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
          >
            <Lock className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        {/* Dynamic Inline Search */}
        <div className="max-w-md mx-auto px-4 pb-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold/60">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat, une boisson..."
              className="w-full bg-black/35 text-white placeholder-gold-light/40 border border-gold/15 focus:border-gold/60 rounded-full py-1.5 pl-9 pr-4 text-xs font-medium focus:ring-0 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gold/60 hover:text-gold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== PUBLIC PAGE MAIN VIEWPORT ===== */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-28">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white/45 rounded-3xl border border-gold/15 shadow-inner">
            <Search className="w-12 h-12 text-gold/30 mx-auto mb-3" />
            <p className="font-sans font-semibold text-sm text-brown text-opacity-80">Aucun plat ne correspond à votre recherche.</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs font-bold text-gold hover:underline"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section 
              key={category.id} 
              id={category.id}
              className="mb-10 scroll-margin-top"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2.5 mb-5 pb-2 border-b-2 border-gold/70 relative">
                <div className="p-1.5 rounded-xl bg-gold/10 text-gold-dark border border-gold/15">
                  <CategoryIcon name={category.icon} className="w-5 h-5" />
                </div>
                <h2 className="font-serif font-bold text-base lg:text-lg text-brown leading-tight tracking-wide uppercase">
                  {category.nom}
                </h2>
                {category.description && (
                  <span className="text-xs text-brown-light/60 font-medium italic ml-auto hidden sm:inline">
                    {category.description}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 w-12 h-[2px] bg-brown" />
              </div>

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.plats.map((plat) => {
                  const selected = isPlatSelected(plat.id);
                  const qty = getPlatQty(plat.id);

                  return (
                    <div
                      key={plat.id}
                      onClick={() => handleToggleItem(plat)}
                      className={`relative flex flex-col justify-between p-4 bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm shadow-brown/5 group ${
                        !plat.disponible 
                          ? "opacity-60 bg-neutral-100 border-neutral-200/50 cursor-not-allowed" 
                          : selected
                            ? "border-gold bg-gradient-to-br from-cream/20 to-white shadow-md shadow-gold/5 transform translate-x-0.5"
                            : "border-transparent hover:border-gold-light hover:translate-y-[-1px] cursor-pointer"
                      }`}
                    >
                      {/* Check Ticker Icon */}
                      {plat.disponible && selected && (
                        <div className="absolute top-3.5 right-3.5 w-5 h-5 bg-gold rounded-full flex items-center justify-center border border-white shadow-md">
                          <Check className="w-3.5 h-3.5 text-brown-dark stroke-[3]" />
                        </div>
                      )}

                      <div className="flex gap-3">
                        {/* Optional base64 or URL image */}
                        {plat.image && (
                          <img 
                            src={plat.image} 
                            alt={plat.nom}
                            className="w-16 h-16 object-cover rounded-xl border border-gold/10 shadow-sm flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className={`font-sans font-bold text-xs lg:text-sm text-brown leading-snug break-words ${!plat.disponible ? "line-through" : ""}`}>
                            {plat.nom}
                          </h3>
                          <p className="text-[10px] lg:text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                            {plat.description}
                          </p>

                          {/* Order Badging for Sur commande items */}
                          {plat.prix === 0 && plat.disponible && (
                            <span className="inline-block mt-2 text-[8px] font-bold text-gold-dark bg-gold/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Sur commande
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions / Interactive Pricing */}
                      <div className="flex items-end justify-between mt-4 pt-3 border-t border-neutral-100">
                        {/* Pricing */}
                        <div>
                          {!plat.disponible ? (
                            <span className="font-sans font-bold text-xs text-neutral-400">Indisponible</span>
                          ) : plat.prix === 0 ? (
                            <span className="font-sans font-bold text-xs text-brown-light italic">Tarif à la demande</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-sans font-extrabold text-sm text-gold-dark tracking-tight">
                                {plat.prix.toLocaleString()} FCFA
                              </span>
                              {plat.unit && (
                                <span className="text-[9px] text-neutral-400 font-medium">/ {plat.unit}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quantity interactive layout - opens if selected */}
                        {plat.disponible && selected && (
                          <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full border border-neutral-200 shadow-inner"
                          >
                            <button
                              onClick={(e) => handleChangeQty(plat.id, -1, e)}
                              className="w-6 h-6 rounded-full bg-white hover:bg-gold/10 text-brown border border-neutral-200 hover:border-gold/30 flex items-center justify-center font-bold text-xs transition-all active:scale-90"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-sans font-bold text-xs text-brown min-w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={(e) => handleChangeQty(plat.id, 1, e)}
                              className="w-6 h-6 rounded-full bg-white hover:bg-gold/10 text-brown border border-neutral-200 hover:border-gold/30 flex items-center justify-center font-bold text-xs transition-all active:scale-90"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* ===== PUBLIC BOTTOM FOOTER ===== */}
      <footer className="bg-brown-dark text-gold-light text-center py-10 px-6 border-t-2 border-gold/15 mt-16 select-none relative z-10 font-sans">
        <div className="max-w-md mx-auto">
          <p className="font-serif font-bold text-[14px] text-gold tracking-[2px] uppercase mb-1">RESTAURANT DELORIA</p>
          <div className="w-10 h-[2.5px] bg-gold mx-auto my-3" />
          <p className="text-[11px] leading-relaxed text-gold-light/60">
            Arrah, quartier CGE — Côte d'Ivoire<br />
            <a href="tel:+2250709919293" className="text-gold hover:underline font-semibold">+225 07 09 91 92 93</a> | <a href="mailto:hoteldeloria@gmail.com" className="text-gold hover:underline font-semibold">hoteldeloria@gmail.com</a><br />
            Ouvert 7j/7 — 07h/23h
          </p>
          <p className="text-[9px] text-gold-light/30 mt-6 font-normal">
            © {new Date().getFullYear()} Deloria. Géré en temps réel via l'espace d'administration.
          </p>
        </div>
      </footer>

      {/* ===== FLOATING CART ACTION BAR ===== */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-[#b98d28] hover:bg-[#a67d22] text-white rounded-full font-sans font-bold text-xs tracking-wider uppercase shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 active:scale-95"
      >
        <ShoppingCart className="w-4 h-4 stroke-[2]" />
        <span>Commander</span>
        <span className="w-5 h-5 rounded-full bg-white text-[#b98d28] flex items-center justify-center text-[10px] font-extrabold shadow-inner ml-0.5">
          {totalItemCount}
        </span>
      </button>

      {/* ===== BOTTOM SHEET CART MODAL ===== */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 z-[2000] flex items-end justify-center backdrop-blur-sm p-0 sm:p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-gold/15 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gold-dark" />
                <h3 className="font-serif font-bold text-sm tracking-widest text-brown uppercase">
                  Votre Commande
                </h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-gold/10 text-brown flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Order items list */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.plat.id} className="flex items-start justify-between gap-3 text-xs border-b border-gold/10 pb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brown leading-tight select-none">
                        {item.plat.nom}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-medium select-none">
                        Qté : {item.qty} × {item.plat.prix === 0 ? "Sur commande" : `${item.plat.prix.toLocaleString()} FCFA`}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 select-none">
                      <span className="font-bold text-gold-dark">
                        {item.plat.prix === 0 ? "À étudier" : `${(item.plat.prix * item.qty).toLocaleString()} FCFA`}
                      </span>
                      {/* Adjust directly inside cart */}
                      <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 rounded-full border border-neutral-200">
                        <button
                          onClick={(e) => handleChangeQty(item.plat.id, -1, e)}
                          className="w-4.5 h-4.5 rounded-full bg-white hover:bg-gold/10 text-brown flex items-center justify-center font-bold text-[10px]"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-bold text-brown px-1 min-w-3 text-center">{item.qty}</span>
                        <button
                          onClick={(e) => handleChangeQty(item.plat.id, 1, e)}
                          className="w-4.5 h-4.5 rounded-full bg-white hover:bg-gold/10 text-brown flex items-center justify-center font-bold text-[10px]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ESTIMATED TOTAL */}
              {cartTotal > 0 && (
                <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-cream/20 to-cream rounded-xl border border-gold/15">
                  <span className="font-serif font-bold text-xs uppercase tracking-wider text-brown select-none">Total estimé</span>
                  <span className="font-sans font-extrabold text-lg text-gold-dark">{cartTotal.toLocaleString()} FCFA</span>
                </div>
              )}

              {/* CLIENT DETAILS */}
              <div className="p-4 bg-gradient-to-br from-cream/30 to-cream rounded-2xl border border-gold/15 space-y-3">
                <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-brown block">
                  Informations client
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={clientInfo.nom}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, nom: e.target.value }))}
                      placeholder="Nom du client"
                      className="w-full bg-white border border-neutral-200 focus:border-gold/40 rounded-xl py-2 pl-8.5 pr-3 text-xs focus:ring-0 focus:outline-none transition-all font-medium text-brown"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="tel"
                      value={clientInfo.tel}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, tel: e.target.value }))}
                      placeholder="Numéro (ex: 0700000000)"
                      className="w-full bg-white border border-neutral-200 focus:border-gold/40 rounded-xl py-2 pl-8.5 pr-3 text-xs focus:ring-0 focus:outline-none transition-all font-medium text-brown"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-neutral-400 leading-normal font-medium mt-1">
                  Facultatif mais utile pour le suivi des plats et des réservations de chambres.
                </p>
              </div>

              {/* SERVICE AREA LOCATOR */}
              <div className="p-4 bg-gradient-to-br from-cream/30 to-cream rounded-2xl border border-gold/15 space-y-3">
                <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-brown block mb-1">
                  Lieu de service
                </span>
                
                {/* 3 Loc Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => selectLocalisation("chambre")}
                    className={`flex flex-col items-center p-2 rounded-xl text-center border font-sans font-semibold text-[10px] tracking-wide transition-all cursor-pointer ${
                      clientInfo.localisation === "chambre"
                        ? "bg-gradient-to-b from-gold/10 to-gold/20 border-gold text-gold-dark"
                        : "bg-white border-neutral-200 hover:border-gold-light text-brown"
                    }`}
                  >
                    <Clock className="w-4 h-4 mb-1" />
                    Chambre
                  </button>
                  <button
                    type="button"
                    onClick={() => selectLocalisation("table")}
                    className={`flex flex-col items-center p-2 rounded-xl text-center border font-sans font-semibold text-[10px] tracking-wide transition-all cursor-pointer ${
                      clientInfo.localisation === "table"
                        ? "bg-gradient-to-b from-gold/10 to-gold/20 border-gold text-gold-dark"
                        : "bg-white border-neutral-200 hover:border-gold-light text-brown"
                    }`}
                  >
                    <MapPin className="w-4 h-4 mb-1" />
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => selectLocalisation("externe")}
                    className={`flex flex-col items-center p-2 rounded-xl text-center border font-sans font-semibold text-[10px] tracking-wide transition-all cursor-pointer ${
                      clientInfo.localisation === "externe"
                        ? "bg-gradient-to-b from-gold/10 to-gold/20 border-gold text-gold-dark"
                        : "bg-white border-neutral-200 hover:border-gold-light text-brown"
                    }`}
                  >
                    <Globe className="w-4 h-4 mb-1" />
                    Externe
                  </button>
                </div>

                {/* Specific local code input (chambre / table n°) */}
                {clientInfo.localisation !== "externe" && (
                  <div className="space-y-1.5 animate-slide-down">
                    <label className="font-sans font-semibold text-[10px] text-brown">
                      Numéro de {clientInfo.localisation === "chambre" ? "chambre" : "table"} :
                    </label>
                    <input
                      type="text"
                      value={clientInfo.localisationDetail}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, localisationDetail: e.target.value }))}
                      placeholder={clientInfo.localisation === "chambre" ? "Ex: Chambre 12, Suite A" : "Ex: Table 4, Terrasse"}
                      className="w-full bg-white border border-neutral-200 focus:border-gold/40 rounded-xl py-2 px-3 text-xs focus:ring-0 focus:outline-none font-medium text-brown"
                    />
                  </div>
                )}

                 {locationError && (
                  <p className="text-[10px] text-rose-500 font-bold tracking-tight animate-bounce flex items-center gap-1">
                    <span>{locationError}</span>
                  </p>
                )}
              </div>

              {/* NOTES EXTRA */}
              <div className="space-y-1.5">
                <label className="font-sans font-bold text-[11px] uppercase tracking-wider text-brown block">
                  Instructions / Préférences
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ex: sans piment, viande bien cuite, heure souhaitée..."
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-gold/40 rounded-xl p-3 text-xs focus:ring-0 focus:outline-none font-medium min-h-[70px] resize-y text-brown"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-6 border-t border-gold/15 space-y-2 shrink-0 bg-neutral-50 rounded-b-3xl">
              <button
                onClick={sendToWhatsApp}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-sans font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-98 transition-all"
              >
                <span>Envoyer Commande par WhatsApp</span>
              </button>
              <button
                onClick={handleClearCart}
                className="w-full py-2.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-600 font-sans font-bold text-[11px] tracking-wide uppercase cursor-pointer"
              >
                Vider le panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
