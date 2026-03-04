// Build Your Kit - Configuration & Pricing
// Centralized pricing configuration for the kit builder

export const KIT_CONFIG = {
  // Currency configuration
  currency: {
    code: 'CZK', // Czech Koruna (можно изменить на 'EUR' для евро)
    symbol: 'Kč',
    position: 'after' as 'before' | 'after', // Symbol position relative to amount
  },

  // LED Strip prices by type and length
  ledStrip: {
    rgb_cct: {
      '5m': 1990,
      '10m': 3490,
      '15m': 4990,
      '20m': 6490,
      '25m': 7990,
      '30m': 9490,
    },
    adjustable_white: {
      '5m': 1490,
      '10m': 2790,
      '15m': 3990,
      '20m': 5290,
      '25m': 6490,
      '30m': 7790,
    },
  },

  // Control system prices
  control: {
    remote: 0, // Included by default
    wifi: 690,
    smart_home: 1190,
  },

  // Power supply prices
  power: {
    standard: 790,
    premium: 1290,
  },
} as const;

// Format price according to currency configuration
export function formatKitPrice(amount: number, locale: string = 'cs-CZ'): string {
  const { code, symbol, position } = KIT_CONFIG.currency;

  // Use Intl.NumberFormat for proper formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedAmount = formatter.format(amount);

  // Return formatted price with currency symbol
  return position === 'after'
    ? `${formattedAmount} ${symbol}`
    : `${symbol}${formattedAmount}`;
}

// Get price breakdown for a kit configuration
export function calculateKitPrice(
  length: keyof typeof KIT_CONFIG.ledStrip.rgb_cct | null,
  lightType: 'rgb_cct' | 'adjustable_white' | null,
  controlType: keyof typeof KIT_CONFIG.control | null,
  powerSupply: keyof typeof KIT_CONFIG.power | null
) {
  if (!length || !lightType || !controlType || !powerSupply) {
    return { ledStrip: 0, control: 0, power: 0, total: 0 };
  }

  const ledStrip = KIT_CONFIG.ledStrip[lightType][length];
  const control = KIT_CONFIG.control[controlType];
  const power = KIT_CONFIG.power[powerSupply];
  const total = ledStrip + control + power;

  return { ledStrip, control, power, total };
}
