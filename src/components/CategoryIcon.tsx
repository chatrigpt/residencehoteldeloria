import { 
  Sun, 
  Apple, 
  Flame, 
  Utensils, 
  Dessert, 
  PlusSquare, 
  GlassWater, 
  CupSoda, 
  Wine, 
  Droplet, 
  Sparkles, 
  Shirt, 
  Scissors, 
  CalendarDays,
  Coffee,
  HelpCircle
} from "lucide-react";

interface CategoryIconProps {
  name?: string;
  className?: string;
}

export default function CategoryIcon({ name, className = "w-5 h-5" }: CategoryIconProps) {
  switch (name) {
    case "Sun":
      return <Sun className={className} />;
    case "Apple":
      return <Apple className={className} />;
    case "Flame":
      return <Flame className={className} />;
    case "Utensils":
      return <Utensils className={className} />;
    case "Dessert":
      return <Dessert className={className} />;
    case "PlusSquare":
      return <PlusSquare className={className} />;
    case "GlassWater":
      return <GlassWater className={className} />;
    case "CupSoda":
      return <CupSoda className={className} />;
    case "Wine":
      return <Wine className={className} />;
    case "Droplet":
    case "Droplets":
      return <Droplet className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "Shirt":
      return <Shirt className={className} />;
    case "Scissors":
      return <Scissors className={className} />;
    case "CalendarDays":
      return <CalendarDays className={className} />;
    case "Coffee":
      return <Coffee className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
}
