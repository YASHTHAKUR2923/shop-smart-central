export type ProductCategory = 'laptop' | 'desktop' | 'network_module' | 'server' | 'accessories' | 'other';
export type Brand = 'dell' | 'hp' | 'lenovo' | 'asus' | 'acer' | 'cisco' | 'juniper' | 'netgear' | 'other';
export type InquiryStatus = 'pending' | 'contacted' | 'quoted' | 'completed' | 'cancelled';
export type AppRole = 'admin' | 'customer';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  brand: Brand;
  price: number | null;
  show_price: boolean;
  image_url: string | null;
  specifications: Record<string, string>;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_id: string | null;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Quotation {
  id: string;
  inquiry_id: string | null;
  customer_email: string;
  items: QuotationItem[];
  total_amount: number | null;
  notes: string | null;
  created_at: string;
}

export interface QuotationItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  laptop: 'Laptops',
  desktop: 'Desktops',
  network_module: 'Network Modules',
  server: 'Servers',
  accessories: 'Accessories',
  other: 'Other',
};

export const BRAND_LABELS: Record<Brand, string> = {
  dell: 'Dell',
  hp: 'HP',
  lenovo: 'Lenovo',
  asus: 'ASUS',
  acer: 'Acer',
  cisco: 'Cisco',
  juniper: 'Juniper',
  netgear: 'Netgear',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  laptop: 'Laptop',
  desktop: 'Monitor',
  network_module: 'Network',
  server: 'Server',
  accessories: 'Cable',
  other: 'Package',
};
