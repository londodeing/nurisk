export interface GeoLocation {
  lat: number;
  lng: number;
  altitude?: number;
  address?: string;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  postalCode?: string;
}
