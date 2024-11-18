export interface Service {
  service: { id: string; name: string };
  variant: { id: string; name: string } | null;
  units: number;
}
