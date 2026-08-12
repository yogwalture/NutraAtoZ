import {
  Home,
  LayoutGrid,
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
  { label: "Categories", href: "/#categories", icon: LayoutGrid },
  { label: "Lab-Tested", href: "/products", icon: FlaskConical },
  { label: "Cart", href: "/cart", icon: ShoppingBag },
  { label: "Account", href: "/vendor/dashboard", icon: User },
];

/** Placeholder data for the "Curated Wellness Categories" section. */
export interface Category {
  name: string;
  tagline: string;
  count: number;
}

export const categories: Category[] = [
  { name: "Immunity & Defense", tagline: "Vitamin C, Zinc, Elderberry", count: 42 },
  { name: "Gut & Digestion", tagline: "Probiotics, Enzymes, Fiber", count: 36 },
  { name: "Sleep & Calm", tagline: "Magnesium, Ashwagandha", count: 28 },
  { name: "Energy & Focus", tagline: "B-Complex, Nootropics", count: 31 },
  { name: "Joint & Mobility", tagline: "Collagen, Glucosamine", count: 24 },
  { name: "Skin & Beauty", tagline: "Biotin, Hyaluronic Acid", count: 19 },
];

/** Placeholder data for the "Lab-Tested Premium Supplements" section. */
export interface Product {
  name: string;
  brand: string;
  price: number;
  rating: number;
  servings: number;
  tag?: string;
}

export const products: Product[] = [
  { name: "Triple-Strength Omega-3", brand: "PureMarine", price: 1299, rating: 4.9, servings: 60, tag: "Bestseller" },
  { name: "Organic Ashwagandha KSM-66", brand: "RootWell", price: 899, rating: 4.8, servings: 90, tag: "Lab-Verified" },
  { name: "Magnesium Glycinate Complex", brand: "Calmora", price: 749, rating: 4.7, servings: 120 },
  { name: "Vitamin D3 + K2 Drops", brand: "SunCore", price: 649, rating: 4.9, servings: 100, tag: "New" },
];
