import { importLibrary } from "@googlemaps/js-api-loader";
import { initGoogleConfig } from "./google-maps-loader";

export async function getDistanceBetween(
  originLat: number,
  originLng: number,
  destinationAddress: string
): Promise<number | null> {
  if (typeof window === "undefined") return null;

  try {
    initGoogleConfig();
    const { DistanceMatrixService } = await importLibrary("routes") as google.maps.RoutesLibrary;

    const service = new DistanceMatrixService();

    return new Promise((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [{ lat: originLat, lng: originLng }],
          destinations: [destinationAddress],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response?.rows[0]?.elements[0]?.distance) {
            resolve(response.rows[0].elements[0].distance.value / 1000);
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error("Erro Distância v2:", error);
    return null;
  }
}