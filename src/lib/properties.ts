import heights from "@/assets/rk-heights.jpg";
import villas from "@/assets/rk-villas.jpg";
import business from "@/assets/rk-business.jpg";
import urban from "@/assets/rk-urban.jpg";
import interior from "@/assets/tour-interior.jpg";
import lifestyle from "@/assets/lifestyle.jpg";

export type Property = {
  slug: string; name: string; detail: string; location: string; price: string;
  priceLakhs: number; image: string; badge: string; category: string;
  status: string; units: string[]; amenities: string[]; specifications: string[];
  imageUrl: string | null; published: boolean; sortOrder: number;
  gallery: { src: string; alt: string }[];
};

export type PropertyRow = {
  slug: string; name: string; detail: string; location: string; price: string; price_lakhs: number;
  category: string; badge: string; status: string; units: string[]; amenities: string[]; specifications: string[];
  image_url: string | null; published: boolean; sort_order: number;
};

const localImages: Record<string, string> = { "rk-heights": heights, "rk-green-villas": villas, "rk-business-park": business, "rk-urban-living": urban };

// Listings are managed by the owner in the dashboard; photography for the original four is illustrative.
export function toProperty(r: PropertyRow): Property {
  const image = r.image_url || localImages[r.slug] || heights;
  return {
    slug: r.slug, name: r.name, detail: r.detail, location: r.location, price: r.price, priceLakhs: Number(r.price_lakhs),
    image, badge: r.badge, category: r.category, status: r.status, units: r.units, amenities: r.amenities, specifications: r.specifications,
    imageUrl: r.image_url, published: r.published, sortOrder: r.sort_order,
    gallery: [{ src: image, alt: `${r.name} exterior` }, { src: interior, alt: "Illustrative living area" }, { src: lifestyle, alt: "Illustrative lifestyle" }],
  };
}
