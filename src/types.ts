interface ProductSpecification {
  name: string;
  value: string | number;
  unit?: string;
}

interface PackageItem {
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  type: 'retail' | 'b2b';
  stripeProductId?: string | null;
  segment?: 'hotel' | 'restaurant' | 'office' | 'mall' | 'exhibition';
  basePrice: number;
  b2bPrice?: number;
  description: string;
  warrantyInfo?: string;
  image: string;
  images?: string[];
  video?: string;
  category: string;
  certifications?: string[];
  installationService?: {
    available: boolean;
    price: number;
    details: string;
  };
  designService?: {
    available: boolean;
    price: number;
    details: string;
  };
  specifications?: ProductSpecification[];
  variants: ProductVariant[];
  features: string[];
  controlOptions: string[];
  compatibleSystems?: string[];
  projectType?: 'residential' | 'commercial';
}

interface ProductVariant {
  id: string;
  length: number;
  price: number;
  stockStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
  stripePriceId?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
  variant: ProductVariant;
  warranty?: WarrantySelection;
  warrantyPolicies?: WarrantyPolicy[];
  adapter?: boolean;
  plugType?: 'EU' | 'UK';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  stripeProductId?: string | null;
}

export interface Review {
  id: string;
  product_id: number;
  rating: number;
  comment?: string;
  author_name: string;
  created_at: string;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  author_name: string;
}

interface PartnerProgram {
  id: string;
  name: string;
  type: 'designer' | 'contractor' | 'architect';
  discountLevel: number;
  benefits: string[];
  requirements: string[];
}

interface EducationalContent {
  id: string;
  title: string;
  type: 'course' | 'webinar' | 'guide';
  description: string;
  duration?: number;
  price?: number;
  materials: string[];
  targetAudience: string[];
}

export interface ProjectCalculation {
  id: string;
  clientId: string;
  projectType: 'residential' | 'commercial';
  requirements: {
    area: number;
    roomType: string;
    lightingType: string[];
    controlType: string;
  };
  calculations: {
    products: Array<{
      id: number;
      quantity: number;
      price: number;
    }>;
    services?: Array<{
      type: string;
      price: number;
    }>;
    totalPrice: number;
  };
  status: 'draft' | 'sent' | 'approved' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface WarrantyPolicy {
  id: string;
  product_id: number;
  months: number;
  description: string;
  terms: string;
  price_multiplier: number;
  fixed_price?: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WarrantySelection {
  policyId: string;
  months: number;
  additionalCost: number;
  stripePriceId?: string;
  description?: string;
  terms?: string;
}

export interface PriceData {
  id: string;
  product_id: number;
  variant_id: string;
  currency: string;
  custom_price: number;
  is_active: boolean;
  updated_at: string;
}

export interface WarrantyPriceData {
  id: string;
  product_id: number;
  variant_id: string;
  months: number;
  currency: string;
  custom_price: number;
  is_active: boolean;
  updated_at: string;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface DeliveryMethod {
  id: string;
  name: string;
  price: number;
  currency: string;
  estimatedDays: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'bank_transfer';
  icon?: React.ReactNode;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerInfo: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  status: string;
  createdAt: string;
  stripeProductId?: string | null;
  userId?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  content: string;
  category: string;
  date: string;
  readTime: number;
}