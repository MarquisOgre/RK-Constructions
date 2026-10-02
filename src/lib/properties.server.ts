import { createPublicClient } from "./public-client.server";
import type { PropertyRow } from "./properties";

export async function fetchPublishedRows(): Promise<PropertyRow[]> {
  const { data, error } = await createPublicClient().from("properties").select("*").eq("published", true).order("sort_order").order("name");
  if (error) throw new Error("Could not load developments.");
  return (data ?? []) as PropertyRow[];
}
