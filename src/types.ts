export interface Plat {
  id: string;
  nom: string;
  description: string;
  prix: number;
  disponible: boolean;
  image?: string; // Optional image URL or base64 encoded string
  unit?: string;  // For example: "tournée", "bouteille"
}

export interface Category {
  id: string;
  nom: string;
  description?: string;
  icon?: string; // Lucide icon name, e.g., "Sun", "Flame", etc.
  plats: Plat[];
}

export interface MenuData {
  categories: Category[];
}

export interface CartItem {
  plat: Plat;
  qty: number;
}

export type LocalisationType = 'chambre' | 'table' | 'externe';

export interface ClientInfo {
  nom: string;
  tel: string;
  localisation: LocalisationType;
  localisationDetail: string; // Suite n°, table n°, etc.
}
