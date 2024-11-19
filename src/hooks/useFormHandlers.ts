import { useFormState } from "./useFormState";
import { validateField } from "./validateField";

export const useFormHandlers = (formState: ReturnType<typeof useFormState>) => {
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { id, value, type } = e.target;

    if (type === "number") {
      const sanitizedValue = value.replace(/[^0-9.]/g, "");
      formState.setFormData((prev) => ({
        ...prev,
        [id]: sanitizedValue,
      }));

      const error = validateField(id, sanitizedValue);
      formState.setErrors((prev) => ({
        ...prev,
        [id]: error || "",
      }));
      return;
    }

    formState.setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    const error = validateField(id, value);
    formState.setErrors((prev) => ({
      ...prev,
      [id]: error || "",
    }));
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formState.setAcceptedTerms(e.target.checked);
    if (e.target.checked) {
      formState.setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    formState.setPaymentMethod(method);
    formState.setErrors((prev) => ({ ...prev, payment: "" }));
  };

  return {
    handleInputChange,
    handleTermsChange,
    handlePaymentMethodSelect,
  };
};
