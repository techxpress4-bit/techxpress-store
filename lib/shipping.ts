// TechXpress shipping rates per wilaya (Zone 1 only).
// Keyed by the 2-digit code that prefixes each entry in `wilayas`
// (e.g. "01 - Adrar" → "01"). `stopDesk: null` means Stop Desk is unavailable
// for that wilaya — customer must select Domicile.

export type ShippingOption = "domicile" | "stop_desk";

export const SHIPPING_OPTION_LABELS: Record<ShippingOption, string> = {
  domicile: "Livraison à domicile",
  stop_desk: "Point relais (Stop Desk)",
};

interface WilayaFees {
  domicile: number;
  stopDesk: number | null;
}

export const SHIPPING_FEES: Record<string, WilayaFees> = {
  "01": { domicile: 1500, stopDesk: 800 },
  "02": { domicile: 850,  stopDesk: 450 },
  "03": { domicile: 950,  stopDesk: 550 },
  "04": { domicile: 850,  stopDesk: 450 },
  "05": { domicile: 850,  stopDesk: 450 },
  "06": { domicile: 850,  stopDesk: 450 },
  "07": { domicile: 900,  stopDesk: 550 },
  "08": { domicile: 1200, stopDesk: 700 },
  "09": { domicile: 700,  stopDesk: 400 },
  "10": { domicile: 850,  stopDesk: 450 },
  "11": { domicile: 1800, stopDesk: 950 },
  "12": { domicile: 900,  stopDesk: 500 },
  "13": { domicile: 900,  stopDesk: 450 },
  "14": { domicile: 850,  stopDesk: 450 },
  "15": { domicile: 800,  stopDesk: 450 },
  "16": { domicile: 500,  stopDesk: 300 },
  "17": { domicile: 950,  stopDesk: 500 },
  "18": { domicile: 850,  stopDesk: 450 },
  "19": { domicile: 850,  stopDesk: 450 },
  "20": { domicile: 850,  stopDesk: 500 },
  "21": { domicile: 850,  stopDesk: 450 },
  "22": { domicile: 850,  stopDesk: 500 },
  "23": { domicile: 850,  stopDesk: 450 },
  "24": { domicile: 900,  stopDesk: 500 },
  "25": { domicile: 800,  stopDesk: 450 },
  "26": { domicile: 800,  stopDesk: 450 },
  "27": { domicile: 850,  stopDesk: 450 },
  "28": { domicile: 900,  stopDesk: 500 },
  "29": { domicile: 850,  stopDesk: 500 },
  "30": { domicile: 1000, stopDesk: 650 },
  "31": { domicile: 850,  stopDesk: 450 },
  "32": { domicile: 1050, stopDesk: 700 },
  "33": { domicile: 2100, stopDesk: 1200 },
  "34": { domicile: 850,  stopDesk: 500 },
  "35": { domicile: 700,  stopDesk: 400 },
  "36": { domicile: 850,  stopDesk: 500 },
  "37": { domicile: 1700, stopDesk: 800 },
  "38": { domicile: 850,  stopDesk: 500 },
  "39": { domicile: 1050, stopDesk: 700 },
  "40": { domicile: 850,  stopDesk: 500 },
  "41": { domicile: 900,  stopDesk: 500 },
  "42": { domicile: 700,  stopDesk: 400 },
  "43": { domicile: 850,  stopDesk: 500 },
  "44": { domicile: 850,  stopDesk: 500 },
  "45": { domicile: 1200, stopDesk: 700 },
  "46": { domicile: 850,  stopDesk: 500 },
  "47": { domicile: 950,  stopDesk: 550 },
  "48": { domicile: 850,  stopDesk: 500 },
  "49": { domicile: 1600, stopDesk: 850 },
  // 50, 54, 56: no rates provided — customer must contact us.
  "51": { domicile: 950,  stopDesk: 550 },
  "52": { domicile: 1300, stopDesk: null }, // Beni Abbes: stop desk unavailable
  "53": { domicile: 1900, stopDesk: 1400 },
  "55": { domicile: 1000, stopDesk: 600 },
  "57": { domicile: 1200, stopDesk: null }, // El M'Ghair: stop desk unavailable
  "58": { domicile: 1100, stopDesk: 700 },
};

/**
 * Extracts the wilaya code (e.g. "16") from the dropdown value ("16 - Alger").
 */
export function wilayaCode(wilaya: string): string {
  const m = String(wilaya).match(/^(\d{2})\b/);
  return m ? m[1] : "";
}

/**
 * Returns the fee for a wilaya + chosen option, or null when the
 * combination is not deliverable (no rates configured, or Stop Desk
 * unavailable in that wilaya).
 */
export function getShippingFee(wilaya: string, option: ShippingOption): number | null {
  const code = wilayaCode(wilaya);
  const fees = SHIPPING_FEES[code];
  if (!fees) return null;
  if (option === "domicile") return fees.domicile;
  return fees.stopDesk; // can be null
}

/**
 * Whether a wilaya has any deliverable option configured.
 */
export function hasShipping(wilaya: string): boolean {
  return !!SHIPPING_FEES[wilayaCode(wilaya)];
}

/**
 * Whether Stop Desk is available for this wilaya.
 */
export function stopDeskAvailable(wilaya: string): boolean {
  const code = wilayaCode(wilaya);
  return !!SHIPPING_FEES[code]?.stopDesk;
}
