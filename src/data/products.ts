import { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: "Universal RGB+CCT",
    type: 'retail',
    stripeProductId: 'prod_S5mUYTNR1sF59r',
    description: `# Universal LED Ceiling Lighting Kit

Professional solution for creating modern lighting with the ability to control color and white light shades.

## Key Benefits

✓ RGB + adjustable white (2700K-6500K)  
✓ COB strip (uniform light, no dots)  
✓ Wi-Fi control via app  
✓ Voice command support  
✓ 10-year lifespan`,
    warrantyInfo: "The 24-month warranty covers all system components subject to proper installation and use. In case of a factory defect, we will replace the defective component free of charge. The service life is 10 years.",
    image: "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/edzur5cpwtt1765066012012.png",
    category: "rgb_cct",
    variants: [
      { id: "rgb-5", length: 5, price: 5350, stockStatus: 'in_stock', stripePriceId: 'price_1RBavEKVsLiX4gAoLBIsBRBo' },
      { id: "rgb-10", length: 10, price: 9850, stockStatus: 'in_stock', stripePriceId: 'price_1RQvQaKVsLiX4gAoAM9jFgQF' },
      { id: "rgb-15", length: 15, price: 14350, stockStatus: 'in_stock', stripePriceId: 'price_1RQvT0KVsLiX4gAo82B7RMv1' },
      { id: "rgb-20", length: 20, price: 18850, stockStatus: 'in_stock', stripePriceId: 'price_1RQvUCKVsLiX4gAoKB4CQoke' },
      { id: "rgb-25", length: 25, price: 23350, stockStatus: 'in_stock', stripePriceId: 'price_1RQvVhKVsLiX4gAosGqmcogz' },
      { id: "rgb-30", length: 30, price: 27850, stockStatus: 'in_stock', stripePriceId: 'price_1RQvX5KVsLiX4gAovDOklpwo' }
    ],
    features: [
      "RGB + adjustable white (2700K-6500K)",
      "COB strip (uniform light, no dots)",
      "Wi-Fi control",
      "Voice command support",
      "10-year lifespan"
    ],
    controlOptions: [
      "Mobile app",
      "Remote control",
      "Voice commands",
      "Scenes and automation"
    ],
    images: [
      "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/edzur5cpwtt1765066012012.png",
      "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/y0ctwgu87ia1765060208433.jpg",
      "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/yk5ueq3apoo1765066034828.JPG",
      "https://www.youtube.com/embed/FkysIFe5oV4"
    ]
  },
  {
    id: 2,
    name: "Adjustable White",
    category: "cct",
    type: 'retail',
    stripeProductId: 'prod_SLys9BCrhGl9Yz',
    description: `# Professional White LED Ceiling Lighting

Modern solution for creating comfortable lighting with adjustable color temperature.

## Key Benefits

✓ Adjustable white light (2700K-6500K)  
✓ COB strip (no dots, uniform light)  
✓ Compact power supplies  
✓ Wi-Fi control  
✓ 10-year lifespan`,
    warrantyInfo: "The 24-month warranty covers all system components subject to proper installation and use. In case of a factory defect, we will replace the defective component free of charge. The service life is 10 years.",
    image: "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/w3y1z73e8n1767462141780.JPG",
    variants: [
      { id: "cct-5", length: 5, price: 4350, stockStatus: 'in_stock', stripePriceId: 'price_1RRGuJKVsLiX4gAouApc9AHB' },
      { id: "cct-10", length: 10, price: 7850, stockStatus: 'in_stock', stripePriceId: 'price_1RRGuJKVsLiX4gAoIQTrRMtc' },
      { id: "cct-15", length: 15, price: 11500, stockStatus: 'in_stock', stripePriceId: 'price_1RRGuJKVsLiX4gAoYc5sUPdJ' },
      { id: "cct-20", length: 20, price: 15100, stockStatus: 'in_stock', stripePriceId: 'price_1RRGuJKVsLiX4gAoVTFh8aJ7' },
      { id: "cct-25", length: 25, price: 18700, stockStatus: 'in_stock', stripePriceId: 'price_1RRGuJKVsLiX4gAoxFj37LDX' },
      { id: "cct-30", length: 30, price: 22300, stockStatus: 'in_stock', stripePriceId: 'price_1RRGuJKVsLiX4gAox64j3r32' }
    ],
    features: [
      "Adjustable white light (2700K-6500K)",
      "COB strip (no dots, uniform light)",
      "Compact power supplies",
      "Wi-Fi control",
      "10-year lifespan"
    ],
    controlOptions: [
      "Mobile app",
      "Remote control",
      "Voice commands",
      "Scenes and automation"
    ],
    images: [
      "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/w3y1z73e8n1767462141780.JPG",
      "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/xixn0n1b7jf1767462148943.jpg",
      "https://aahexteequomvfvlvkal.supabase.co/storage/v1/object/public/product-images/products/5lhecl9qtqa1767462154393.JPG",
      "https://www.youtube.com/embed/FkysIFe5oV4"
    ]
  }
];