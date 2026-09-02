import {
  Home,
  Target,
  FlaskConical,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

/** Primary nav links — shared across desktop header, tablet drawer, mobile bar. */
export interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Shop", href: "/products", icon: FlaskConical },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Account", href: "/account", icon: User },
];

/** Wellness discovery categories (goal-based, not medical). */
export interface Category {
  name: string;
  tagline: string;
}

export const categories: Category[] = [
  { name: "Immunity & Wellness", tagline: "Vitamin C, Zinc, Elderberry" },
  { name: "Gut & Digestion", tagline: "Probiotics, Enzymes, Fiber" },
  { name: "Sleep & Calm", tagline: "Magnesium, Ashwagandha" },
  { name: "Energy & Focus", tagline: "B-Complex, Nootropics" },
  { name: "Joint & Mobility", tagline: "Collagen, Glucosamine" },
  { name: "Skin & Beauty", tagline: "Biotin, Hyaluronic Acid" },
];

/** Demo fallback shown only if the live catalog is empty. Not real inventory. */
export interface Product {
  name: string;
  brand: string;
  price: number;
  rating: number;
  servings: number;
  tag?: string;
}

export const products: Product[] = [
  { name: "Triple-Strength Omega-3", brand: "PureMarine", price: 1299, rating: 0, servings: 60, tag: "Demo" },
  { name: "Organic Ashwagandha KSM-66", brand: "RootWell", price: 899, rating: 0, servings: 90, tag: "Demo" },
  { name: "Magnesium Glycinate Complex", brand: "Calmora", price: 749, rating: 0, servings: 120, tag: "Demo" },
  { name: "Vitamin D3 + K2 Drops", brand: "SunCore", price: 649, rating: 0, servings: 100, tag: "Demo" },
];
