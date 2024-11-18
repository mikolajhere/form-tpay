export interface FinalizationData {
  addressStreetName: string;
  addressStreetNumber: string;
  addressFlatNumber: string;
  addressPostalCode: string;
  addressCity: string;
  paymentType: string;
  isInvoice: boolean;
  companyName?: string;
  companyNIP?: string;
  isGift: boolean;
  giftData?: string;
  voucherValue?: number;
  passId?: string;
}
