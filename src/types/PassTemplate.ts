import { Service } from "./Service";

export interface PassTemplate {
  type: string;
  id: string;
  name: string;
  price: number;
  validityDays: number;
  enabled: boolean;
  availableOnline: boolean;
  services: Service[];
}
