export interface FormData {
  email: string;
  phone: string;
  name: string;
  surname: string;
  shippingFlatNumber: string;
  shippingStreetNumber: string;
  shippingStreet: string;
  shippingCity: string;
  shippingPostal: string;
  giftRecipientName: string;
  companyName: string;
  nip: string;
  [key: string]: string;
  voucherValue: string;
}
