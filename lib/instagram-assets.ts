export type InstagramAsset = {
  id: string;
  title: string;
  category: string;
  src: string;
  href: string;
  alt: string;
  width: number;
  height: number;
  layout: "feature" | "wide" | "compact";
};

export const instagramAssets: InstagramAsset[] = [
  {
    id: "open-days",
    title: "Vuoi collaborare con noi?",
    category: "Open Days",
    src: "/media/instagram/open-days.jpg",
    href: "https://www.instagram.com/siamounmagazine/p/DctTgtzjJMF/",
    alt: "Poster illustrato SIAMO Open Days con la scritta Vuoi collaborare con noi?",
    width: 1280,
    height: 1585,
    layout: "feature",
  },
  {
    id: "festival-recap",
    title: "SIAMO il terzo festival",
    category: "Live",
    src: "/media/instagram/festival-recap.jpg",
    href: "https://www.instagram.com/siamounmagazine/p/DbA7AC-jNFO/",
    alt: "Artista sul palco durante SIAMO il terzo festival",
    width: 1080,
    height: 1350,
    layout: "wide",
  },
  {
    id: "magazine-third-issue",
    title: "Terzo magazine",
    category: "Cartaceo",
    src: "/media/instagram/magazine-third-issue.jpg",
    href: "https://www.instagram.com/siamounmagazine/p/DSkQ8SWjD2o/",
    alt: "Terzo magazine SIAMO sospeso davanti a luci sfocate",
    width: 720,
    height: 900,
    layout: "compact",
  },
  {
    id: "tipule-collab",
    title: "Orto × Tipule",
    category: "Partnership",
    src: "/media/instagram/tipule-collab.jpg",
    href: "https://www.instagram.com/tipulefest/p/DclU1rmDbe_/",
    alt: "Grafica verde e rosa della collaborazione Orto per Tipule Fest",
    width: 1080,
    height: 1350,
    layout: "compact",
  },
  {
    id: "hypersimposio-selton",
    title: "HyperSimposio × Selton",
    category: "Contenuti",
    src: "/media/instagram/hypersimposio-selton.jpg",
    href: "https://www.instagram.com/hypersilviavilloresi/reel/DbYIpZLIcsi/",
    alt: "Ospite al microfono e tavola rotonda durante HyperSimposio con i Selton",
    width: 720,
    height: 1280,
    layout: "wide",
  },
];
