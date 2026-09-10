export type SellPrice = {
  category: string;
  range: [number, number];
  unit: string;
  example: string;
  highlight?: boolean;
};

export const sellPrices: SellPrice[] = [
  {
    category: "HP Rusak",
    range: [80000, 600000],
    unit: "/unit",
    example: "Mati total / LCD pecah / bootloop",
    highlight: true,
  },
  {
    category: "Laptop Rusak",
    range: [500000, 2500000],
    unit: "/unit",
    example: "Mati total / no display",
    highlight: true,
  },
  {
    category: "GPU",
    range: [150000, 2500000],
    unit: "/pcs",
    example: "Artefak / no display",
    highlight: true,
  },
  {
    category: "PC Rakitan Rusak",
    range: [300000, 1800000],
    unit: "/unit",
    example: "Fullset minus VGA / mati",
  },
  {
    category: "Mainboard",
    range: [70000, 400000],
    unit: "/pcs",
    example: "Korslet / mati",
  },
  {
    category: "CPU",
    range: [50000, 800000],
    unit: "/pcs",
    example: "Core i3 - i7 / Ryzen",
  },
  {
    category: "HDD/SSD Rusak",
    range: [40000, 200000],
    unit: "/pcs",
    example: "Bad sector / bunyi",
  },
  {
    category: "Lainnya",
    range: [30000, 500000],
    unit: "/pcs",
    example: "RAM / PSU / Charger",
  },
];
