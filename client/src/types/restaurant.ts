export type LocationRelevance = {
  assessed: boolean;
  distanceMiles: number | null;
  withinSearchRadius: boolean | null;
};

export type RestaurantJson = {
  alias: string;
  name: string;
  rating: {
    value: number | null;
    formats: { display: string };
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    formats: { display: string };
  };
  coordinates: {
    latitude?: number | null;
    longitude?: number | null;
    formats: { display: string };
  };
  locationRelevance?: LocationRelevance;
};
