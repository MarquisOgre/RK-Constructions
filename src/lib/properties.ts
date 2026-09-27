import heights from "@/assets/rk-heights.jpg";
import villas from "@/assets/rk-villas.jpg";
import business from "@/assets/rk-business.jpg";
import urban from "@/assets/rk-urban.jpg";
import interior from "@/assets/tour-interior.jpg";
import lifestyle from "@/assets/lifestyle.jpg";

export type Property = {
  slug: string; name: string; detail: string; location: string; price: string;
  priceLakhs: number; image: string; badge: string; category: "Residential" | "Commercial" | "Plots";
  status: string; units: string[]; amenities: string[]; specifications: string[];
  gallery: { src: string; alt: string }[];
};

// This local catalogue is illustrative, not live inventory or verified construction data.
export const properties: Property[] = [
  {
    slug: "rk-heights", name: "RK Heights", detail: "Premium 2 & 3 BHK Apartments", location: "Hyderabad", price: "₹75 Lakhs", priceLakhs: 75,
    image: heights, badge: "New Launch", category: "Residential", status: "New Launch",
    units: ["2 BHK apartments", "3 BHK apartments"], amenities: ["Landscaped grounds", "Fitness space", "Resident parking", "Community gathering space"],
    specifications: ["Contemporary apartment layouts", "Natural light-focused design", "Dedicated residential access"],
    gallery: [{ src: heights, alt: "Illustrative exterior of RK Heights" }, { src: interior, alt: "Illustrative apartment living area" }, { src: lifestyle, alt: "Illustrative residential lifestyle" }],
  },
  {
    slug: "rk-green-villas", name: "RK Green Villas", detail: "Luxury 4 BHK Villas", location: "Bengaluru", price: "₹2.5 Crores", priceLakhs: 250,
    image: villas, badge: "Luxury", category: "Residential", status: "Luxury Homes",
    units: ["4 BHK villas"], amenities: ["Private outdoor space", "Landscaped paths", "Resident parking", "Family living areas"],
    specifications: ["Independent villa format", "Spacious multi-room layout", "Indoor-outdoor living concept"],
    gallery: [{ src: villas, alt: "Illustrative exterior of RK Green Villas" }, { src: lifestyle, alt: "Illustrative family lifestyle" }, { src: interior, alt: "Illustrative interior finish" }],
  },
  {
    slug: "rk-business-park", name: "RK Business Park", detail: "Premium Office Spaces", location: "Chennai", price: "₹80 Lakhs", priceLakhs: 80,
    image: business, badge: "Commercial", category: "Commercial", status: "Commercial",
    units: ["Office spaces", "Flexible commercial units"], amenities: ["Visitor reception", "Parking", "Common circulation areas", "Business-ready setting"],
    specifications: ["Flexible office configurations", "Contemporary commercial frontage", "Designed for professional use"],
    gallery: [{ src: business, alt: "Illustrative exterior of RK Business Park" }, { src: urban, alt: "Illustrative urban development" }, { src: heights, alt: "Illustrative architectural detail" }],
  },
  {
    slug: "rk-urban-living", name: "RK Urban Living", detail: "Modern 1, 2 & 3 BHK Homes", location: "Pune", price: "₹65 Lakhs", priceLakhs: 65,
    image: urban, badge: "Ready to Move", category: "Residential", status: "Ready to Move",
    units: ["1 BHK apartments", "2 BHK apartments", "3 BHK apartments"], amenities: ["Shared green space", "Fitness space", "Resident parking", "Community area"],
    specifications: ["Practical apartment layouts", "Natural light-focused design", "Urban residential setting"],
    gallery: [{ src: urban, alt: "Illustrative exterior of RK Urban Living" }, { src: interior, alt: "Illustrative living space" }, { src: lifestyle, alt: "Illustrative family setting" }],
  },
];