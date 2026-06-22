import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Download, 
  Upload, 
  Save, 
  Sparkles, 
  Lock, 
  User, 
  FolderPlus, 
  CheckCircle,
  FileText,
  HelpCircle,
  LogOut,
  FolderOpen,
  X
} from "lucide-react";
import { Category, Plat, MenuData } from "../types";
import CategoryIcon from "./CategoryIcon";

interface AdminPanelProps {
  initialMenu: MenuData;
  onSaveMenu: (newMenu: MenuData) => Promise<boolean>;
  onCloseAdmin: () => void;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const AVAILABLE_ICONS = [
  "Sun", "Apple", "Flame", "Utensils", "Dessert", "PlusSquare", 
  "GlassWater", "CupSoda", "Wine", "Droplets", "Sparkles", "Shirt", "Scissors", "CalendarDays"
];

export default function AdminPanel({ initialMenu, onSaveMenu, onCloseAdmin, onShowToast }: AdminPanelProps) {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Menu Mutable States
  const [menuState, setMenuState] = useState<MenuData>(JSON.parse(JSON.stringify(initialMenu)));
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    initialMenu.categories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  // Forms Modal States
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Utensils");

  const [editingPlat, setEditingPlat] = useState<{ plat: Plat; categoryId: string } | null>(null);
  const [isAddingPlat, setIsAddingPlat] = useState<string | null>(null); //categoryId
  
  // Plat Form inputs
  const [platName, setPlatName] = useState("");
  const [platDesc, setPlatDesc] = useState("");
  const [platPrix, setPlatPrix] = useState<number>(0);
  const [platDisponible, setPlatDisponible] = useState(true);
  const [platImage, setPlatImage] = useState("");
  const [platUnit, setPlatUnit] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === "admin" && password === "deloria2026") {
      setIsAuthenticated(true);
      setAuthError("");
      onShowToast("Connexion administration réussie !", "success");
    } else {
      setAuthError("Nom d'utilisateur ou mot de passe incorrect.");
      onShowToast("Identifiants de connexion invalides.", "error");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    onShowToast("Déconnexion réussie.", "info");
  };

  // Accordion Toggle
  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // ----- CATEGORY CRUD -----
  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      onShowToast("Le nom de la catégorie est obligatoire.", "error");
      return;
    }
    const slug = newCatName.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, "-") // slugify
      .replace(/(^-|-$)/g, "");

    const newCat: Category = {
      id: slug || `cat-${Date.now()}`,
      nom: newCatName.trim(),
      icon: newCatIcon,
      plats: []
    };

    setMenuState(prev => ({
      ...prev,
      categories: [...prev.categories, newCat]
    }));

    setExpandedCategories(prev => ({ ...prev, [newCat.id]: true }));
    setIsAddingCategory(false);
    setNewCatName("");
    setNewCatIcon("Utensils");
    onShowToast(`Catégorie "${newCat.nom}" ajoutée localement. N'oubliez pas d'enregistrer !`, "success");
  };

  const handleStartEditCategory = (cat: Category, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingCategory(cat);
    setNewCatName(cat.nom);
    setNewCatIcon(cat.icon || "Utensils");
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;
    if (!newCatName.trim()) {
      onShowToast("Le nom ne peut pas être vide.", "error");
      return;
    }

    setMenuState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, nom: newCatName.trim(), icon: newCatIcon } 
          : c
      )
    }));

    setEditingCategory(null);
    setNewCatName("");
    onShowToast("Modifications de la catégorie appliquées.", "success");
  };

  const handleDeleteCategory = (catId: string, catName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${catName}" et tous ses plats ?`)) {
      setMenuState(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== catId)
      }));
      onShowToast(`Catégorie "${catName}" supprimée.`, "info");
    }
  };


  // ----- PLAT CRUD -----
  const handleStartAddPlat = (categoryId: string) => {
    setIsAddingPlat(categoryId);
    setPlatName("");
    setPlatDesc("");
    setPlatPrix(0);
    setPlatDisponible(true);
    setPlatImage("");
    setPlatUnit("");
  };

  const handleCreatePlat = () => {
    if (!isAddingPlat) return;
    if (!platName.trim()) {
      onShowToast("Le nom du plat est obligatoire.", "error");
      return;
    }

    const newPlat: Plat = {
      id: `plat-${Date.now()}`,
      nom: platName.trim(),
      description: platDesc.trim(),
      prix: Number(platPrix),
      disponible: platDisponible,
      image: platImage.trim() || undefined,
      unit: platUnit.trim() || undefined
    };

    setMenuState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === isAddingPlat 
          ? { ...c, plats: [...c.plats, newPlat] } 
          : c
      )
    }));

    setIsAddingPlat(null);
    onShowToast(`Plat "${newPlat.nom}" ajouté à la catégorie. Enregistrez pour publier !`, "success");
  };

  const handleStartEditPlat = (plat: Plat, categoryId: string) => {
    setEditingPlat({ plat, categoryId });
    setPlatName(plat.nom);
    setPlatDesc(plat.description);
    setPlatPrix(plat.prix);
    setPlatDisponible(plat.disponible);
    setPlatImage(plat.image || "");
    setPlatUnit(plat.unit || "");
  };

  const handleSavePlatEdit = () => {
    if (!editingPlat) return;
    if (!platName.trim()) {
      onShowToast("Le nom ne peut pas être vide.", "error");
      return;
    }

    setMenuState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === editingPlat.categoryId
          ? {
              ...c,
              plats: c.plats.map(p => 
                p.id === editingPlat.plat.id
                  ? {
                      ...p,
                      nom: platName.trim(),
                      description: platDesc.trim(),
                      prix: Number(platPrix),
                      disponible: platDisponible,
                      image: platImage.trim() || undefined,
                      unit: platUnit.trim() || undefined
                    }
                  : p
              )
            }
          : c
      )
    }));

    setEditingPlat(null);
    onShowToast("Plat mis à jour.", "success");
  };

  const handleDeletePlat = (platId: string, platName: string, categoryId: string) => {
    if (confirm(`Supprimer définitivement le plat "${platName}" ?`)) {
      setMenuState(prev => ({
        ...prev,
        categories: prev.categories.map(c => 
          c.id === categoryId 
            ? { ...c, plats: c.plats.filter(p => p.id !== platId) } 
            : c
        )
      }));
      onShowToast(`Plat "${platName}" supprimé.`, "info");
    }
  };

  const handleTogglePlatAvailability = (platId: string, categoryId: string) => {
    setMenuState(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === categoryId 
          ? {
              ...c,
              plats: c.plats.map(p => 
                p.id === platId ? { ...p, disponible: !p.disponible } : p
              )
            }
          : c
      )
    }));
    onShowToast("Disponibilité du plat mise à jour.", "success");
  };

  // Device image dynamic upload -> base64 buffer conversion in browser memory
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onShowToast("L'image est trop lourde (2 Mo maximum).", "error");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPlatImage(reader.result as string);
      setIsUploading(false);
      onShowToast("Image chargée avec succès !", "success");
    };
    reader.onerror = () => {
      setIsUploading(false);
      onShowToast("Impossible de liere l'image.", "error");
    };
    reader.readAsDataURL(file);
  };


  // ----- DATABASE PUBLISH & EXPORT PROCEDURES -----
  const handleSaveChangesToServer = async () => {
    onShowToast("Publication en cours sur le serveur...", "info");
    const success = await onSaveMenu(menuState);
    if (success) {
      onShowToast("Sauvegarde générale réussie ! Menu public mis à jour en direct.", "success");
    } else {
      onShowToast("Échec de la sauvegarde sur le serveur.", "error");
    }
  };

  // Local JSON File export dynamic trigger
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(menuState, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `deloria-menu-backup-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast("Sauvegarde JSON exportée.", "success");
    } catch {
      onShowToast("Impossible de générer le fichier de sauvegarde.", "error");
    }
  };

  // Local JSON File import dynamic trigger
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.categories)) {
          setMenuState(parsed);
          onShowToast("Fichier de sauvegarde importé localement. Enregistrez pour publier !", "success");
        } else {
          onShowToast("Format de fichier JSON de menu invalide.", "error");
        }
      } catch {
        onShowToast("Format JSON corrompu ou illisible.", "error");
      }
    };
    reader.readAsText(file);
  };

  // ----- AUTHENTICATION SPLASH LOGIN SCREEN -----
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-2 border-gold/20 shadow-2xl overflow-hidden p-8 relative">
          {/* Brand border bottom highlight */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-gold via-gold-dark to-gold" />

          <button 
            onClick={onCloseAdmin}
            className="absolute top-4 left-4 flex items-center gap-1 p-1 px-2.5 rounded-full bg-neutral-100 hover:bg-gold/10 text-brown text-[10px] font-bold tracking-wider uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </button>

          <div className="text-center mt-6 mb-8 select-none">
            <img 
              src="https://monadia-bucket.sfo3.cdn.digitaloceanspaces.com/Capture%20d'%C3%A9cran%202026-05-20%20223523.png" 
              alt="Logo Deloria" 
              className="w-16 h-16 object-contain rounded-full bg-neutral-100 p-1 border-2 border-gold mx-auto mb-3"
            />
            <h1 className="font-serif font-bold text-lg text-brown tracking-widest uppercase">Espace Admin</h1>
            <p className="text-[10px] font-medium tracking-wide text-neutral-400 mt-1 uppercase">RESTAURANT DELORIA</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Nom d'utilisateur</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-0 text-brown"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Mot de passe</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-0 text-brown"
                />
              </div>
            </div>

            {authError && (
              <p className="text-[10px] text-rose-500 font-bold tracking-tight bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-brown-dark font-sans font-bold text-xs tracking-wider uppercase shadow-lg shadow-gold/15 transition-all duration-300 cursor-pointer active:scale-98"
            >
              Se Connecter
            </button>
          </form>

          {/* Prompt reminder for user guidelines */}
          <div className="mt-8 text-center text-[9px] text-neutral-400 font-medium">
            Entrée sécurisée. Administrateur seulement.<br/>
            (Identifiants: admin / deloria2026)
          </div>
        </div>
      </div>
    );
  }

  // ----- MAIN WORKspace CONTAINER (Once Authorized) -----
  return (
    <div className="min-h-screen bg-neutral-50 pb-20 font-sans">
      {/* ===== ADMIN TOP BAR ===== */}
      <nav className="sticky top-0 z-40 bg-brown-dark text-gold-light border-b-2 border-gold py-3.5 px-6 shadow-md shadow-brown/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <h2 className="font-serif font-bold text-xs sm:text-sm tracking-widest uppercase">Espace Admin • Deloria</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveChangesToServer}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-full font-bold text-[10px] tracking-widest uppercase shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Publier</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 bg-red-500/10 border border-red-500/20 hover:border-red-400 text-red-300 rounded-full cursor-pointer transition-all"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onCloseAdmin}
              className="p-2 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-full cursor-pointer transition-all"
              title="Retourner au Menu Client"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8 select-none">
          <div>
            <h1 className="text-xl font-extrabold text-brown tracking-tight">Gestionnaire de Catalogue</h1>
            <p className="text-xs text-neutral-400 font-medium mt-0.5">Ajoutez des catégories, ajustez vos plats, gérez vos prix et ruptures de stock instantanément.</p>
          </div>

          {/* Save backups handlers */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-600 rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all shadow-sm cursor-pointer"
              title="Télécharger une copie de sauvegarde JSON du menu actuel"
            >
              <Download className="w-3 h-3" />
              <span>Sauvegarder</span>
            </button>

            <label className="flex items-center gap-1 px-3 py-1.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-600 rounded-xl font-bold text-[10px] tracking-wider uppercase transition-all shadow-sm cursor-pointer inline-block">
              <Upload className="w-3 h-3" />
              <span>Restaurer</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        {/* Global Save Check Banner */}
        <div className="mb-6 p-3 px-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-3 text-xs text-amber-800">
          <p className="font-medium">
            <strong>Info :</strong> Les modifications s'appliquent sur l'écran en temps réel mais pour les rendre définitives sur le serveur pour tous les téléphones de vos clients, vous devez impérativement appuyer sur le bouton vert <strong>PUBLIER</strong> en haut à droite.
          </p>
        </div>

        {/* CATEGORY WORKSPACE BOX LIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <span className="font-serif font-bold text-xs text-brown tracking-wider uppercase flex items-center gap-1.5 select-none">
              <FolderOpen className="w-4 h-4 text-gold-dark" />
              Arborescence des Rubriques
            </span>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="flex items-center gap-1 p-1.5 px-3 bg-gold hover:bg-gold-light text-brown-dark rounded-xl font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Ajouter une rubrique
            </button>
          </div>

          {menuState.categories.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-200/60 rounded-3xl shadow-sm">
              <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <p className="font-bold text-xs text-neutral-500">Aucune rubrique n'a encore été deffinie.</p>
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="mt-3 text-xs font-bold text-gold hover:underline"
              >
                Créer la première catégorie
              </button>
            </div>
          ) : (
            menuState.categories.map((cat, index) => {
              const expanded = !!expandedCategories[cat.id];
              return (
                <div key={cat.id} className="bg-white border border-neutral-200 shadow-sm rounded-2xl overflow-hidden">
                  {/* Category Header workspace */}
                  <div
                    onClick={() => toggleCategoryExpand(cat.id)}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-neutral-50 to-white hover:from-neutral-100/60 transition-colors cursor-pointer border-b border-neutral-100 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-gold/10 text-gold-dark border border-gold/15">
                        <CategoryIcon name={cat.icon} className="w-4.5 h-4.5" />
                      </div>
                      <span className="font-serif font-bold text-xs tracking-wider text-brown uppercase">
                        {index + 1}. {cat.nom}
                      </span>
                      <span className="text-[10px] font-bold bg-neutral-100 border text-neutral-500 px-2 py-0.5 rounded-full">
                        {cat.plats.length} {cat.plats.length > 1 ? "plats" : "plat"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleStartEditCategory(cat, e)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg hover:scale-105 transition-all cursor-pointer"
                        title="Modifier le nom ou l'icône"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCategory(cat.id, cat.nom, e)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg hover:scale-105 transition-all cursor-pointer"
                        title="Supprimer la rubrique"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-neutral-400 p-1">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* PLAT ITEMS AREA */}
                  {expanded && (
                    <div className="p-4 space-y-3 bg-neutral-50/20">
                      {/* Action trigger */}
                      <div className="flex justify-end mb-1">
                        <button
                          onClick={() => handleStartAddPlat(cat.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gold-light border border-neutral-200 hover:border-gold rounded-full font-bold text-[9px] uppercase tracking-wider text-brown transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-gold-dark" />
                          <span>Ajouter un plat</span>
                        </button>
                      </div>

                      {cat.plats.length === 0 ? (
                        <p className="text-center py-6 text-neutral-400 text-[10px] italic">Aucun plat dans cette rubrique.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {cat.plats.map((plat) => (
                            <div 
                              key={plat.id}
                              className={`p-3 rounded-xl border flex gap-3 justify-between items-start transition-colors ${
                                !plat.disponible 
                                  ? "bg-neutral-100 border-neutral-200/50" 
                                  : "bg-white border-neutral-200"
                              }`}
                            >
                              <div className="flex gap-2.5 min-w-0 flex-1">
                                {plat.image && (
                                  <img 
                                    src={plat.image} 
                                    alt={plat.nom}
                                    className="w-12 h-12 object-cover rounded-lg border border-gold/10 flex-shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className={`text-xs font-bold leading-snug truncate ${!plat.disponible ? "line-through text-neutral-400" : "text-brown"}`}>
                                    {plat.nom}
                                  </h4>
                                  <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1 truncate font-normal">{plat.description}</p>
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <span className="font-bold text-[11px] text-gold-dark">
                                      {plat.prix === 0 ? "Sur commande" : `${plat.prix.toLocaleString()} FCFA`}
                                    </span>
                                    {plat.unit && (
                                      <span className="text-[9px] text-neutral-400 font-medium select-none">/ {plat.unit}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Plat micro-modifiers */}
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button
                                  onClick={() => handleTogglePlatAvailability(plat.id, cat.id)}
                                  className={`p-1 rounded-md border text-xs cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                                    plat.disponible
                                      ? "bg-emerald-50 border-emerald-200 hover:border-emerald-500 text-emerald-600"
                                      : "bg-rose-50 border-rose-200 hover:border-rose-500 text-rose-600"
                                  }`}
                                  title={plat.disponible ? "Marquer comme En Rupture / Indisponible" : "Marquer comme Disponible"}
                                >
                                  {plat.disponible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  onClick={() => handleStartEditPlat(plat, cat.id)}
                                  className="p-1 bg-neutral-100 border border-neutral-200 hover:border-neutral-400 text-neutral-600 rounded-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                                  title="Modifier"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeletePlat(plat.id, plat.nom, cat.id)}
                                  className="p-1 bg-red-50 border border-red-100 hover:border-red-400 text-red-600 rounded-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===== POPUP MODAL: ADD / EDIT RUBRIQUE ===== */}
      {(isAddingCategory || editingCategory) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gold/15 overflow-hidden">
            <div className="bg-brown-dark border-b border-gold text-gold-light px-5 py-4">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                {isAddingCategory ? "Ajouter une rubrique ID" : "Modifier la rubrique ID"}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown select-none">Nom de la rubrique</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Entrées, Spécialités Chef..."
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-0 text-brown font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown block select-none">Icône représentative</label>
                <div className="grid grid-cols-5 gap-2 max-h-[140px] overflow-y-auto border border-neutral-200 p-2.5 rounded-xl bg-neutral-50 no-scrollbar">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewCatIcon(iconName)}
                      className={`p-2 rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        newCatIcon === iconName
                          ? "bg-gold border-gold text-brown-dark font-black"
                          : "bg-white border-neutral-200 text-neutral-400 hover:border-gold/30 hover:text-brown"
                      }`}
                    >
                      <CategoryIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setEditingCategory(null);
                    setNewCatName("");
                  }}
                  className="flex-1 py-2 font-bold text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-100 rounded-xl transition-all cursor-pointer hover:bg-neutral-200"
                >
                  Annuler
                </button>
                <button
                  onClick={isAddingCategory ? handleCreateCategory : handleSaveCategoryEdit}
                  className="flex-1 py-2 font-bold text-[10px] uppercase tracking-wider text-brown bg-gold hover:bg-gold-light rounded-xl transition-all cursor-pointer"
                >
                  {isAddingCategory ? "Créer" : "Appliquer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== POPUP MODAL: ADD / EDIT PLAT ===== */}
      {(isAddingPlat !== null || editingPlat !== null) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-fade-in select-none">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gold/15 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="bg-brown-dark border-b border-gold text-gold-light px-5 py-4 shrink-0">
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                {isAddingPlat !== null ? "Ajouter un plat au menu" : "Modifier le plat"}
              </h3>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4 flex-1 font-sans">
              
              {/* Image Input Selection Block */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Illustration du plat</label>
                
                {platImage ? (
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-neutral-300 shadow-inner group">
                    <img 
                      src={platImage} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setPlatImage("")}
                      className="absolute inset-0 bg-black/50 hover:bg-black/70 flex items-center justify-center text-white text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {/* Device File selection uploader */}
                    <label className="flex-1 p-3 bg-white hover:bg-neutral-100 border border-neutral-300 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 group-hover:text-brown">Charger un fichier</span>
                      <span className="text-[8px] text-neutral-400 mt-0.5">Max 2 Mo • PNG/JPG</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        className="hidden" 
                      />
                    </label>

                    {/* Or standard URL input */}
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-[8px] text-neutral-400 font-bold mb-1 uppercase tracking-wider">Ou coller adresse d'image</span>
                      <input
                        type="text"
                        value={platImage}
                        onChange={(e) => setPlatImage(e.target.value)}
                        placeholder="http://exemple.com/image.jpg"
                        className="w-full bg-white border border-neutral-300 focus:border-gold/45 rounded-lg py-1 px-2 text-[10px] focus:outline-none focus:ring-0 text-brown"
                      />
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <p className="text-[9px] text-gold-dark font-bold font-mono tracking-tight animate-pulse">Conversion de l'image en cours...</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Nom du plat</label>
                <input
                  type="text"
                  value={platName}
                  onChange={(e) => setPlatName(e.target.value)}
                  placeholder="Ex: Omelette nature, Kedjenou..."
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-0 text-brown font-semibold animate-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Description / Ingrédients</label>
                <input
                  type="text"
                  value={platDesc}
                  onChange={(e) => setPlatDesc(e.target.value)}
                  placeholder="Ex: moélleux, pimenté à l'attiéké..."
                  className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-0 text-brown font-semibold"
                />
              </div>

              {/* Price & Unit Box */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Tarif (FCFA) • 0 = sur commande</label>
                  <input
                    type="number"
                    value={platPrix || ""}
                    onChange={(e) => setPlatPrix(Number(e.target.value))}
                    placeholder="Ex: 1500"
                    min="0"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-0 text-brown font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brown block">Unité de mesure (optionnel)</label>
                  <input
                    type="text"
                    value={platUnit}
                    onChange={(e) => setPlatUnit(e.target.value)}
                    placeholder="Ex: tournée, carpe, bouteille"
                    className="w-full bg-neutral-50 border border-neutral-300 focus:border-gold/45 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-0 text-brown font-semibold"
                  />
                </div>
              </div>

              {/* Toggle Stock Disponible */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-brown block">Disponible en stock</span>
                  <span className="text-[9px] text-neutral-400 font-medium">Afficher ou barrer/désactiver sur le menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlatDisponible(prev => !prev)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    platDisponible ? "bg-emerald-500" : "bg-neutral-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      platDisponible ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            </div>

            {/* Modal actions */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50 flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsAddingPlat(null);
                  setEditingPlat(null);
                }}
                className="flex-1 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-100 transition-all cursor-pointer hover:bg-neutral-200"
              >
                Annuler
              </button>
              <button
                onClick={isAddingPlat !== null ? handleCreatePlat : handleSavePlatEdit}
                className="flex-1 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider text-brown bg-gold hover:bg-gold-light transition-all cursor-pointer"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
