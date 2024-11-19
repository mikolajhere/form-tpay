// hooks/useFormState.ts
import { useState } from "react";
import { PassTemplate } from "../types/PassTemplate";
import { ErrorDetails } from "./errorDetails";
import { TransactionDetails } from "./transactionDetails";
import { FormDataContainer } from "../types/FormData";

export const useFormState = () => {
  const [formData, setFormData] = useState<FormDataContainer>({
    email: "",
    phone: "",
    name: "",
    surname: "",
    giftRecipientName: "",
    shippingStreet: "",
    shippingFlatNumber: "",
    shippingStreetNumber: "",
    shippingCity: "",
    shippingPostal: "",
    companyName: "",
    nip: "",
    voucherValue: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [needsVAT, setNeedsVAT] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<PassTemplate | null>(
    null,
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [voucherValue, setVoucherValue] = useState("");
  const [pageType, setPageType] = useState("");
  const [currentView, setCurrentView] = useState("form");
  const [transactionDetails, setTransactionDetails] =
    useState<TransactionDetails | null>(null);
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null);

  return {
    formData,
    setFormData,
    paymentMethod,
    setPaymentMethod,
    isGift,
    setIsGift,
    errors,
    setErrors,
    needsVAT,
    setNeedsVAT,
    formStep,
    setFormStep,
    selectedTemplate,
    setSelectedTemplate,
    acceptedTerms,
    setAcceptedTerms,
    isSubmiting,
    setIsSubmiting,
    transactionId,
    setTransactionId,
    voucherValue,
    setVoucherValue,
    pageType,
    setPageType,
    currentView,
    setCurrentView,
    transactionDetails,
    setTransactionDetails,
    errorDetails,
    setErrorDetails,
  };
};
