import { useEffect, useState } from "react";
import { FormData } from "../types/FormData";
import { PassTemplate } from "../types/PassTemplate";
import { formValidationRules } from "../hooks/formValidationRules";
import { validateField } from "../hooks/validateField";
import { formatTemplateTitle } from "../hooks/formatTemplateTitle";
import { renderTitle } from "../hooks/renderTitle";
import { toast } from "sonner";
import { ThankYouPage } from "./ThankYouPage";
import { FinalizationData } from "../hooks/finalizationData";

const FormContainer = () => {
  const [formData, setFormData] = useState<FormData>({
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);

  const [showThankYou, setShowThankYou] = useState(false);
  const [voucherValue, setVoucherValue] = useState("");
  const [pageType, setPageType] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");

    if (type === "card-pass") {
      setPageType("card-pass");
      const cardId = url.searchParams.get("cardID");
      const serviceId = url.searchParams.get("serviceID");
      if (cardId) {
        fetchTemplate(cardId, serviceId);
      }
    } else if (type === "voucher") {
      setPageType("voucher");
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { id, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Validate field on change
    const error = validateField(id, value);

    setErrors((prev) => ({
      ...prev,
      [id]: error || "",
    }));
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    const step1Fields = ["email", "name", "surname"];
    step1Fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional custom validations
    if (!acceptedTerms) {
      newErrors.terms = "Musisz zaakceptować regulamin i politykę prywatności";
    }

    if (isGift) {
      const giftError = validateField(
        "giftRecipientName",
        formData.giftRecipientName,
      );
      if (giftError) {
        newErrors.giftRecipientName = giftError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    const shippingFields = [
      "shippingStreet",
      "shippingStreetNumber",
      "shippingFlatNumber",
      "shippingCity",
      "shippingPostal",
    ];

    shippingFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate company info if VAT invoice is needed
    if (needsVAT) {
      const companyError = validateField("companyName", formData.companyName);
      const nipError = validateField("nip", formData.nip);

      if (!formData.companyName) {
        newErrors.companyName = "Nazwa firmy jest wymagana";
      } else if (companyError) {
        newErrors.companyName = companyError;
      }

      if (!formData.nip) {
        newErrors.nip = "NIP jest wymagany";
      } else if (nipError) {
        newErrors.nip = nipError;
      }
    }

    if (!paymentMethod) {
      newErrors.payment = "Wybierz metodę płatności";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderInputField = (
    id: string,
    label: string,
    required: boolean = false,
    type: string = "text",
    options?: { label: string; value: string }[], // For select inputs
    multiline: boolean = false, // For textarea inputs
    setCustomValue?: (value: string) => void, // Optional custom setter
  ) => (
    <div className="mb-4">
      <label className="mb-1.5 inline-block text-sm" htmlFor={id}>
        {label} {required && "*"}
      </label>
      {type === "select" && options ? (
        <select
          className={`w-full border ${
            errors[id] ? "border-red-500" : "border-gray-200"
          } px-4 py-3 text-sm`}
          id={id}
          value={formData[id]}
          onChange={(e) => {
            handleInputChange(e);
            if (setCustomValue) {
              setCustomValue(e.target.value);
            }
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          className={`w-full border ${
            errors[id] ? "border-red-500" : "border-gray-200"
          } px-4 py-3 text-sm`}
          id={id}
          value={formData[id]}
          onChange={(e) => {
            handleInputChange(e);
            if (setCustomValue) {
              setCustomValue(e.target.value);
            }
          }}
          rows={4}
          maxLength={formValidationRules.find((r) => r.field === id)?.maxLength}
        />
      ) : (
        <input
          className={`w-full border ${
            errors[id] ? "border-red-500" : "border-gray-200"
          } px-4 py-3 text-sm`}
          id={id}
          type={type}
          value={formData[id]}
          onChange={(e) => {
            handleInputChange(e);

            // Additional validation for number fields
            if (type === "number" && id === "voucherValue") {
              const value = parseFloat(e.target.value);
              if (setVoucherValue) {
                setVoucherValue(e.target.value);
              }

              if (value < 100 || value > 5000) {
                setErrors((prev) => ({
                  ...prev,
                  [id]: "Kwota musi być pomiędzy 100 a 5000",
                }));
              } else {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[id];
                  return newErrors;
                });
              }
            }
          }}
          maxLength={formValidationRules.find((r) => r.field === id)?.maxLength}
          min={type === "number" && id === "voucherValue" ? 100 : undefined}
          max={type === "number" && id === "voucherValue" ? 5000 : undefined}
        />
      )}
      {errors[id] && <p className="mt-1 text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
    if (e.target.checked) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.terms;
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    if (formStep === 1 && validateStep1()) {
      setFormStep(2);
    } else if (formStep === 2 && validateStep2()) {
      setFormStep(3);
    }
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setErrors((prev) => ({ ...prev, payment: "" }));
  };

  const fetchTemplate = async (id: string, serviceId?: string | null) => {
    try {
      const response = await fetch(
        "https://boscopanel.nxtm.pl/api/pass-template/list",
      );
      const templates: PassTemplate[] = await response.json();
      const template = templates.find((t) => t.id === id);
      if (template) {
        // If serviceId is provided, find the specific service
        if (serviceId) {
          const matchingService = template.services.find(
            (service) => service.service.id === serviceId,
          );
          if (matchingService) {
            setSelectedTemplate({
              ...template,
              // Move the matching service to be first in the array
              services: [
                matchingService,
                ...template.services.filter((s) => s.service.id !== serviceId),
              ],
            });
          } else {
            setSelectedTemplate(template);
          }
        } else {
          setSelectedTemplate(template);
        }
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  const PaymentOption = ({
    method,
    label,
    imageSrc,
  }: {
    method: string;
    label: string;
    imageSrc: string;
  }) => (
    <div
      className="mb-2 w-full cursor-pointer"
      onClick={() => handlePaymentMethodSelect(method)}
    >
      <div className="border border-gray-200 p-4 hover:border-gray-300">
        <div className="-m-2 flex flex-wrap items-center justify-between">
          <div className="w-auto p-2">
            <label className="relative flex items-center gap-2">
              <input
                className="custom-radio-1 absolute h-4 w-4 opacity-0"
                type="radio"
                name="payment-method"
                checked={paymentMethod === method}
                onChange={() => {}}
              />
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border border-gray-600 ${
                  paymentMethod === method ? "bg-gray-900" : ""
                }`}
              >
                {paymentMethod === method && (
                  <span className="h-2 w-2 rounded-full bg-white"></span>
                )}
              </span>
              <span className="text-sm">{label}</span>
            </label>
          </div>
          <div className="w-auto p-2">
            <img src={imageSrc} alt="" className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFirstStep = () => (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-16">
      {selectedTemplate && (
        <h1 className="order-1 mb-2 text-pretty text-base font-semibold leading-7 text-gray-900 md:hidden">
          {formatTemplateTitle(selectedTemplate)}
        </h1>
      )}
      <div className="order-3 flex-1 md:order-1">
        {selectedTemplate ? (
          <div>
            <h1 className="mb-4 hidden text-2xl font-bold md:block">
              {renderTitle()} karnet {selectedTemplate.name}
            </h1>

            <div className="hidden grid-cols-1 text-sm/6 sm:grid sm:grid-cols-[min(50%,theme(spacing.80))_auto]">
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Cena
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-zinc-950/5 sm:py-3">
                {selectedTemplate.price.toFixed(2)} zł
              </dd>
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Ważność
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
                {selectedTemplate.validityDays} dni
              </dd>
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Usługi
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
                {selectedTemplate.services.map((service, index) => (
                  <div key={index}>
                    {service.service.name} ({service.units}x)
                  </div>
                ))}
              </dd>
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Warianty
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
                {selectedTemplate.services.every(
                  (service) => !service.variant,
                ) ? (
                  <div>Brak wariantu</div>
                ) : (
                  selectedTemplate.services.map((service, index) => (
                    <div key={index}>
                      {service.variant
                        ? service.variant.name
                        : "Brak wariantów"}
                    </div>
                  ))
                )}
              </dd>
            </div>
            {selectedTemplate.availableOnline ? (
              <div
                className="my-4 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800"
                role="alert"
              >
                <span className="font-medium">Uwaga!</span> Sprzedaż karnetu
                jest obecnie niemożliwa! Skontaktuj się z nami mailowo na{" "}
                <a
                  href="mailto:boscoclinic@gmail.com"
                  className="hover:underline hover:underline-offset-4"
                >
                  boscoclinic@gmail.com
                </a>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        ) : (
          <div>
            <p className="mb-4 h-2.5 w-96 animate-pulse rounded-full bg-gray-200 text-center"></p>
            <p className="mb-4 h-2.5 w-48 animate-pulse rounded-full bg-gray-200 text-center"></p>
            <p className="mb-4 h-2.5 w-48 animate-pulse rounded-full bg-gray-200 text-center"></p>
          </div>
        )}
      </div>
      <div className="order-2 h-fit border border-gray-100 bg-gray-100 px-4 py-6 md:order-2 lg:min-w-[526px]">
        <div>
          <h3 className="pb-4 text-base font-semibold">Dane kontaktowe</h3>
          {renderInputField("name", "Imię", true)}
          {renderInputField("surname", "Nazwisko", true)}
          {renderInputField("email", "Adres e-mail", true, "email")}
          {renderInputField("phone", "Numer telefonu", true, "tel")}

          <div className="mb-4">
            <label className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Czy to prezent?</span>
            </label>
          </div>
          {isGift &&
            renderInputField(
              "giftRecipientName",
              "Imię i nazwisko osoby obdarowanej",
              true,
            )}
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="min-h-4 min-w-4"
              checked={acceptedTerms}
              onChange={handleTermsChange}
            />
            <span className="text-sm">
              Akceptuję{" "}
              <a href="#" className="font-bold underline">
                regulamin
              </a>{" "}
              i{" "}
              <a href="#" className="font-bold underline">
                politykę prywatności*
              </a>{" "}
            </span>
          </label>
          <div style={{ marginTop: 4 }}>
            {errors.terms && (
              <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleNextStep}
          className="mt-6 w-full bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          disabled={
            !selectedTemplate?.availableOnline || !selectedTemplate?.enabled
          }
        >
          Dalej
        </button>
      </div>
    </div>
  );

  const renderBillingAddress = () => (
    <div className="flex flex-col gap-4 md:flex-row md:gap-16">
      <div className="flex-1">
        <div className="h-fit border border-gray-200 px-4 py-6">
          <h6 className="mb-4 text-center text-lg font-semibold">
            Adres nabywcy
          </h6>
          {renderInputField("shippingStreet", "Ulica")}
          {renderInputField("shippingStreetNumber", "Numer domu", true)}
          {renderInputField("shippingFlatNumber", "Numer lokalu")}
          {renderInputField("shippingCity", "Miejscowość", true)}
          {renderInputField("shippingPostal", "Kod pocztowy")}

          <div className="mt-4 border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={needsVAT}
                onChange={(e) => setNeedsVAT(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm">Potrzebuję faktury VAT</span>
            </label>

            {needsVAT && (
              <div className="mt-4">
                <div className="mb-4">
                  <label
                    className="mb-1.5 inline-block text-sm"
                    htmlFor="company-name"
                  >
                    Nazwa firmy
                  </label>
                  <input
                    className={`w-full border ${
                      errors.companyName ? "border-red-500" : "border-gray-200"
                    } px-4 py-3 text-sm`}
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 inline-block text-sm" htmlFor="nip">
                    NIP
                  </label>
                  <input
                    className={`w-full border ${
                      errors.nip ? "border-red-500" : "border-gray-200"
                    } px-4 py-3 text-sm`}
                    id="nip"
                    type="text"
                    value={formData.nip}
                    onChange={handleInputChange}
                  />
                  {errors.nip && (
                    <p className="mt-1 text-xs text-red-500">{errors.nip}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="border border-gray-200 px-4 py-6">
          <h3 className="pb-4 text-center text-lg font-semibold">
            Metoda płatności
          </h3>
          <PaymentOption method="blik" label="Blik" imageSrc="blik.svg" />
          <PaymentOption method="tpay" label="Tpay" imageSrc="tpay_logo.svg" />
          {errors.payment && (
            <p className="mt-1 text-xs text-red-500">{errors.payment}</p>
          )}
          <button
            onClick={handleNextStep}
            className="mt-6 w-full bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Dalej
          </button>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="border border-gray-100 bg-gray-100 px-4 py-6">
      <h6 className="mb-4 text-xl font-semibold">Podsumowanie zamówienia</h6>
      {selectedTemplate && (
        <div className="grid grid-cols-1 text-sm/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto]">
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Nazwa
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none border-t-0 pb-3 pt-1 text-zinc-950 sm:border-zinc-950/5 sm:py-3">
            {selectedTemplate.name}
          </dd>
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Cena
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
            {selectedTemplate.price.toFixed(2)} zł
          </dd>

          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Osoba obdarowana
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
            {formData.giftRecipientName}
          </dd>
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Ważność
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
            {selectedTemplate.validityDays} dni
          </dd>
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Usługi
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
            {selectedTemplate.services.map((service, index) => (
              <div key={index}>
                {service.service.name} ({service.units}x)
              </div>
            ))}
          </dd>
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Warianty
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
            {selectedTemplate.services.every((service) => !service.variant) ? (
              <div>Brak wariantu</div>
            ) : (
              selectedTemplate.services.map((service, index) => (
                <div key={index}>
                  {service.variant ? service.variant.name : "Brak wariantów"}
                </div>
              ))
            )}
          </dd>
        </div>
      )}

      {pageType === "voucher" ? (
        <>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-1 text-sm/6 sm:grid-cols-[min(50%,theme(spacing.80))_auto]">
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Imię i nazwisko
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none border-t-0 pb-3 pt-1 text-zinc-950 sm:border-zinc-950/5 sm:py-3">
                {formData.name} {formData.surname}
              </dd>
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Kwota
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
                {voucherValue}
              </dd>
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Osoba obdarowana
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
                {formData.giftRecipientName}
              </dd>
              <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
                Ważność
              </dt>
              <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
                {new Date(
                  new Date().getTime() + 90 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString()}
              </dd>
            </div>
          </div>
        </>
      ) : (
        <div></div>
      )}

      {errors.submission && (
        <p className="mt-2 text-sm text-red-500">{errors.submission}</p>
      )}
      {errors.finalization && (
        <p className="mt-2 text-sm text-red-500">{errors.finalization}</p>
      )}
      {!transactionId ? (
        <button
          onClick={handleSubmitForm}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          disabled={isSubmiting}
        >
          {isSubmiting && <div className="loader"></div>}
          {isSubmiting ? "Przetwarzanie..." : "Potwierdź i zapłać"}
        </button>
      ) : (
        <button
          onClick={handleFinalizeTransaction}
          className="mt-6 flex w-full items-center justify-center gap-2 bg-green-800 px-7 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          disabled={isSubmiting}
        >
          {isSubmiting && <div className="loader"></div>}
          {isSubmiting ? "Przetwarzanie..." : "Finalizuj transakcję"}
        </button>
      )}
    </div>
  );

  const handleSubmitForm = async () => {
    try {
      setIsSubmiting(true);
      const transactionData = {
        email: formData.email,
        phone: formData.phone,
        firstName: formData.name,
        lastName: formData.surname,
      };

      const response = await fetch(
        "https://boscopanel.nxtm.pl/api/storefront/transaction/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        },
      );

      if (response.ok) {
        const result = await response.json();
        setTransactionId(result.id);
        console.log("Transaction created successfully:", result);
        setIsSubmiting(false);
        toast.success(
          'Transakcja została utworzona pomyślnie. Kliknij "Finalizuj transakcję", aby kontynuować.',
        );
      } else {
        setIsSubmiting(false);
        setErrors((prev) => ({
          ...prev,
          captcha: "Weryfikacja nie powiodła się. Spróbuj ponownie.",
        }));
      }
    } catch (error) {
      console.error("Error verifying captcha:", error);
      setIsSubmiting(false);
      setErrors((prev) => ({
        ...prev,
        captcha: "Wystąpił błąd. Spróbuj ponownie później.",
      }));
    }
  };

  const handleFirstStepContent = () => {
    if (pageType === "voucher") {
      return (
        <>
          <h1 className="order-1 mb-4 block text-pretty text-xl font-semibold leading-7 text-gray-900 md:hidden">
            Kupujesz voucher
          </h1>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-16">
            <div className="flex-1">
              <h1 className="order-1 mb-4 hidden text-pretty text-xl font-semibold leading-7 text-gray-900 md:block">
                Kupujesz voucher
              </h1>
              <div className="border border-gray-200 px-4 py-6">
                <h3 className="mb-6 text-base font-semibold">
                  Wartość vouchera
                </h3>
                {renderInputField("voucherValue", "Kwota (zł)", true, "number")}
              </div>
            </div>

            <div className="order-2 h-fit border border-gray-100 bg-gray-100 px-4 py-6 md:order-2 lg:min-w-[526px]">
              <div>
                <h3 className="pb-4 text-base font-semibold">
                  Dane kontaktowe
                </h3>
                {renderInputField("name", "Imię", true)}
                {renderInputField("surname", "Nazwisko", true)}
                {renderInputField("email", "Adres e-mail", true, "email")}
                {renderInputField("phone", "Numer telefonu", true, "tel")}

                <div className="mb-4">
                  <label className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => setIsGift(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Czy to prezent?</span>
                  </label>
                </div>
                {isGift &&
                  renderInputField(
                    "giftRecipientName",
                    "Imię i nazwisko osoby obdarowanej",
                    true,
                  )}
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="min-h-4 min-w-4"
                    checked={acceptedTerms}
                    onChange={handleTermsChange}
                  />
                  <span className="text-sm">
                    Akceptuję{" "}
                    <a href="#" className="font-bold underline">
                      regulamin
                    </a>{" "}
                    i{" "}
                    <a href="#" className="font-bold underline">
                      politykę prywatności*
                    </a>{" "}
                  </span>
                </label>
                <div style={{ marginTop: 4 }}>
                  {errors.terms && (
                    <p className="mt-1 text-xs text-red-500">{errors.terms}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleNextStep}
                className="mt-6 w-full bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                disabled={!voucherValue || !formData.email || !acceptedTerms}
              >
                Dalej
              </button>
            </div>
          </div>
        </>
      );
    }
    return renderFirstStep();
  };

  const renderPaymentScreen = () => (
    <div className="flex h-screen items-center justify-center">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          STRONA Z PŁATNOŚCIĄ
        </h2>
        <div className="mb-4 h-12 w-full animate-pulse rounded-md bg-gray-200"></div>
        <div className="mb-4 h-12 w-full animate-pulse rounded-md bg-gray-200"></div>
        <div className="h-12 w-full animate-pulse rounded-md bg-gray-200"></div>
        <button
          onClick={() => setShowThankYou(true)}
          className="mt-4 bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Powrót
        </button>
      </div>
    </div>
  );

  const handleFinalizeTransaction = async () => {
    if (!transactionId) return;

    try {
      setIsSubmiting(true);
      const finalizationData: FinalizationData = {
        addressStreetName: formData.shippingStreet,
        addressStreetNumber: formData.shippingStreetNumber,
        addressFlatNumber: formData.shippingFlatNumber,
        addressPostalCode: formData.shippingPostal,
        addressCity: formData.shippingCity,
        paymentType: paymentMethod,
        isInvoice: needsVAT,
        companyName: needsVAT ? formData.companyName : undefined,
        companyNIP: needsVAT ? formData.nip : undefined,
        isGift: isGift,
        giftData: isGift ? formData.giftRecipientName : undefined,
      };

      if (pageType === "voucher") {
        // Convert currency string "216,00 zł" to number 216.00
        const numericValue = voucherValue
          .replace(/[^\d,]/g, "") // Remove all non-digit characters except comma
          .replace(",", "."); // Replace comma with decimal point
        finalizationData.voucherValue = parseFloat(numericValue);
      } else if (selectedTemplate) {
        finalizationData.passId = selectedTemplate.id;
      }

      const response = await fetch(
        `https://boscopanel.nxtm.pl/api/storefront/transaction/finalize/${transactionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalizationData),
        },
      );

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
        // setShowPaymentScreen(true);
      } else {
        const errorData = await response.json();
        setIsSubmiting(false);
        setErrors((prev) => ({
          ...prev,
          finalization:
            errorData.detail || "Wystąpił błąd podczas finalizacji transakcji.",
        }));
      }
    } catch (error) {
      console.error("Error finalizing transaction:", error);
      setIsSubmiting(false);
      setErrors((prev) => ({
        ...prev,
        finalization: "Wystąpił błąd. Spróbuj ponownie później.",
      }));
    }
  };

  return (
    <section className="pb-8 pt-6 sm:pt-9">
      <div className="mx-auto max-w-6xl px-4">
        {showThankYou ? (
          <ThankYouPage
            formData={formData}
            selectedTemplate={selectedTemplate}
            voucherValue={voucherValue}
          />
        ) : showPaymentScreen ? (
          renderPaymentScreen()
        ) : (
          <div>
            <nav aria-label="Proces" className="mb-8 hidden md:block">
              <ol
                role="list"
                className="space-y-4 md:flex md:space-x-8 md:space-y-0"
              >
                <li className="md:flex-1">
                  <div
                    className={`flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                      formStep >= 1 ? "border-yellow-600" : "border-gray-500"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        formStep >= 1 ? "text-yellow-600" : "text-gray-500"
                      }`}
                    >
                      Krok 1
                    </span>
                    <span className="text-sm font-medium">Dane kontaktowe</span>
                  </div>
                </li>
                <li className="md:flex-1">
                  <div
                    className={`flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                      formStep >= 2 ? "border-yellow-600" : "border-gray-300"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        formStep >= 2 ? "text-yellow-600" : "text-gray-500"
                      } `}
                    >
                      Krok 2
                    </span>
                    <span className="text-sm font-medium">
                      Adres i metoda płatności
                    </span>
                  </div>
                </li>
                <li className="md:flex-1">
                  <div
                    className={`flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 ${
                      formStep >= 3 ? "border-yellow-600" : "border-gray-300"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        formStep >= 3 ? "text-yellow-600" : "text-gray-500"
                      } `}
                    >
                      Krok 3
                    </span>
                    <span className="text-sm font-medium">Podsumowanie</span>
                  </div>
                </li>
              </ol>
            </nav>

            {formStep === 1 && handleFirstStepContent()}
            {formStep === 2 && renderBillingAddress()}
            {formStep === 3 && renderSummary()}
          </div>
        )}
      </div>
    </section>
  );
};

export default FormContainer;
