import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { properties } from "./properties";

const preferences = z.object({ budget: z.string().trim().min(1).max(100), location: z.string().trim().min(1).max(100), lifestyle: z.string().trim().min(3).max(600) });

export const recommendProperties = createServerFn({ method: "POST" })
  .inputValidator((data) => preferences.parse(data))
  .handler(async ({ data }) => {
    const { generateRecommendations } = await import("./recommendations.server");
    return generateRecommendations(data, properties.map(({ slug, name, location, price, priceLakhs, detail, category, units, amenities }) => ({ slug, name, location, price, priceLakhs, detail, category, units, amenities })));
  });