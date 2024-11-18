import { Service } from "./Service";

export interface PassTemplate {
  id: string;
  name: string;
  price: number;
  validityDays: number;
  enabled: boolean;
  availableOnline: boolean;
  services: Service[];
}
