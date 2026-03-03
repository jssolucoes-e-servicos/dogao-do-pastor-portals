import { setOptions } from "@googlemaps/js-api-loader";

export const initGoogleConfig = () => {
  if (typeof window === "undefined") return;

  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    v: "weekly",
    language: "pt-BR",
    region: "BR"
  });
};