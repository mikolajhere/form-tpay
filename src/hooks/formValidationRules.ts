/* eslint-disable no-useless-escape */
import { ValidationRules } from "../types/ValidationRules";

export const formValidationRules: ValidationRules[] = [
  // Personal Information
  {
    field: "name",
    maxLength: 50,
    pattern: /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
    required: false,
    description: "Letters, spaces, and hyphens only. Max 50 chars.",
  },
  {
    field: "surname",
    maxLength: 50,
    pattern: /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
    required: false,
    description: "Letters, spaces, and hyphens only. Max 50 chars.",
  },
  {
    field: "email",
    maxLength: 100,
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    required: true,
    description: "Valid email format. Max 100 chars.",
  },
  {
    field: "phone",
    maxLength: 15,
    pattern: /^\+?[0-9]{9,15}$/,
    required: false,
    description: "Numbers only, optional '+' prefix. 9-15 digits.",
  },
  {
    field: "giftRecipientName",
    maxLength: 100,
    pattern: /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
    required: true,
    description: "Letters, spaces, and hyphens only. Max 100 chars.",
  },

  // Shipping Address
  {
    field: "shippingStreet",
    maxLength: 100,
    pattern: /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.,-]+$/,
    required: false,
    description:
      "Letters, numbers, spaces, dots, commas, hyphens. Max 100 chars.",
  },
  {
    field: "shippingStreetNumber",
    maxLength: 10,
    pattern: /^[0-9A-Za-z\/-]+$/,
    required: true,
    description: "Numbers, letters, forward slash, hyphen. Max 10 chars.",
  },
  {
    field: "shippingFlatNumber",
    maxLength: 10,
    pattern: /^[0-9A-Za-z]+$/,
    required: false,
    description: "Numbers and letters only. Max 10 chars.",
  },
  {
    field: "shippingCity",
    maxLength: 50,
    pattern: /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/,
    required: true,
    description: "Letters, spaces, and hyphens only. Max 50 chars.",
  },
  {
    field: "shippingPostal",
    maxLength: 6,
    pattern: /^(\d{2}-\d{3}|\d{5})$/,
    required: false,
    description: "Postal code format: XX-XXX or XXXXX",
  },

  // Company Information
  {
    field: "companyName",
    maxLength: 100,
    pattern: /^[A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.,-]+$/,
    required: false,
    description:
      "Letters, numbers, spaces, dots, commas, hyphens. Max 100 chars.",
  },
  {
    field: "nip",
    maxLength: 10,
    pattern: /^\d{10}$/,
    required: false,
    description: "Exactly 10 digits for Polish NIP number",
  },
];
