/* ==========================================================================
   FENYX INTERIORS — PORTFOLIO & CASE STUDIES DATABASE
   Curated Luxury Case Studies with Full Architectural Data
   ========================================================================== */

const PROJECTS_DATA = [
  {
    id: "atelier-office",
    title: "Atelier Executive Headquarters",
    subtitle: "Sophisticated Biophilic Workspace for Private Wealth",
    category: "office",
    tags: ["Office", "Commercial", "Modern"],
    location: "Tribeca, New York",
    year: "2025",
    area: "14,200 sq.ft",
    timeline: "10 Months",
    scope: "Turnkey Commercial Renovation & Custom Acoustic Systems",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85"
    ],
    summary: "Redefining corporate prestige with curved smoked glass partitions, micro-cement seamless flooring, integrated espresso lounge, and acoustic felt baffles.",
    clientBrief: "Create an inspiring, quiet executive workspace that encourages creative collaboration without sacrificing executive privacy and confidential boardrooms.",
    materials: [
      "Smoked Acoustic Glass",
      "Charcoal Micro-cement",
      "Blackened Steel Framing",
      "Bespoke Italian Leather Seating",
      "Lutron Intelligent Daylight Harvesting"
    ],
    challenges: "Vibration isolation across three heritage floors in downtown Manhattan and custom routing for fiber-optic smart building integration.",
    result: "Achieved LEED Platinum status and 98% positive employee spatial satisfaction index."
  },
  {
    id: "urban-penthouse",
    title: "The Sky Penthouse",
    subtitle: "Double-Height Panoramic Luxury Above the City",
    category: "luxury",
    tags: ["Luxury", "Residential", "Modern"],
    location: "Downtown, Dubai",
    year: "2026",
    area: "8,900 sq.ft",
    timeline: "12 Months",
    scope: "Full Interior Design, Turnkey Fitout & Smart Automation",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85"
    ],
    summary: "A dramatic triplex penthouse featuring a 7-meter backlit onyx fireplace wall, floating bronze staircase, and an open-concept chef's Poliform-style modular kitchen.",
    clientBrief: "A showcase home designed for art collectors, requiring museum-grade color rendering index (CRI 98) lighting and bespoke temperature-controlled display cabinetry.",
    materials: [
      "Calacatta Gold Bookmatched Marble",
      "Honey Onyx (Backlit Translucent)",
      "Smoked Mirror Cladding",
      "Solid Smoked Oak Parquet",
      "Polished Bronze Balustrades"
    ],
    challenges: "Hoisting single-slab 3.2m marble panels to the 54th floor and coordinating structural load distributions for the cantilevered indoor plunge pool.",
    result: "Featured in Architectural Digest Middle East as 'Penthouse of the Year 2026'."
  },
  {
    id: "boutique-retail",
    title: "Maison Haute Horlogerie",
    subtitle: "Immersive Luxury Watch & Fine Jewelry Boutique",
    category: "retail",
    tags: ["Retail", "Commercial", "Luxury"],
    location: "Rue du Rhône, Geneva",
    year: "2025",
    area: "3,200 sq.ft",
    timeline: "6 Months",
    scope: "Spatial Concept, Custom Vitrines & Security Engineering",
    coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=85"
    ],
    summary: "An ultra-tactile retail sanctum featuring silk wall coverings, anti-reflective armored glass display pods, and warm champagne acoustic ceilings.",
    clientBrief: "Elevate the customer journey into an intimate, VIP consultation salon with discreet private viewing lounges and bespoke scent diffusion.",
    materials: [
      "Champagne PVD Stainless Steel",
      "Hand-loomed Mulberry Silk Wallcoverings",
      "Nero Marquina Marble Podiums",
      "Dimmable Fiber-Optic Micro Spotlights"
    ],
    challenges: "Integrating high-security biometric locks and ballistic-grade partitions while maintaining an ethereal, welcoming ambiance.",
    result: "Average customer in-store dwell time increased by 140% post-opening."
  },
  {
    id: "villa-solstice",
    title: "Villa Solstice",
    subtitle: "Mediterranean Hillside Retreat with Seamless Indoor-Outdoor Flow",
    category: "residential",
    tags: ["Residential", "Luxury", "Modern"],
    location: "Mallorca, Spain",
    year: "2025",
    area: "9,500 sq.ft",
    timeline: "14 Months",
    scope: "Full Villa Renovation, Infinity Pool Lounge & Custom Furniture",
    coverImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
    ],
    summary: "Organic minimalism meeting timeless Mediterranean stone, cantilevered pergola terraces, and custom water features.",
    clientBrief: "Transform a dated 1980s villa into an eco-conscious luxury estate that celebrates panoramic sea views and natural cross-ventilation.",
    materials: [
      "Santanyí Limestone",
      "Aged Teak Decking",
      "Handmade Terracotta Tiles",
      "Woven Seagrass & Linen Accents"
    ],
    challenges: "Adapting steep hillside topography with minimal excavation while integrating sustainable geothermal heating and greywater recycling.",
    result: "Featured in Belle Australia and Elle Decor International."
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PROJECTS_DATA };
}
