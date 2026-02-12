import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

export async function getDistanceBetween(
  originLat: number,
  originLng: number,
  destinationAddress: string
): Promise<number | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key ausente.");
    return null;
  }

  try {
    // Configura a API
    setOptions({
      key: apiKey,
      v: "weekly",
    });

    // Importa a lib "routes" para ter acesso à DistanceMatrixService
    const { DistanceMatrixService } = (await importLibrary("routes")) as google.maps.RoutesLibrary;

    const service = new DistanceMatrixService();

    return new Promise<number | null>((resolve, reject) => {
      console.info('discated',reject);
      service.getDistanceMatrix(
        {
          origins: [{ lat: originLat, lng: originLng }],
          destinations: [destinationAddress],
          travelMode: google.maps.TravelMode.DRIVING,
          region: "br",
        },
        (response, status) => {
          if (!response){
            return null;
          }
          console.log('destinationAddress', destinationAddress);
          
          if (status === google.maps.DistanceMatrixStatus.OK && response.rows[0]?.elements[0]?.distance) {
            const distanceMeters = response.rows[0].elements[0].distance.value;
            console.log('google: ',response.rows[0].elements[0].distance.value)
            resolve(distanceMeters / 1000);
          } else {
            console.error("Erro no DistanceMatrix:", status, response);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error("Erro ao calcular distância com DistanceMatrix:", error);
    return null;
  }
}
