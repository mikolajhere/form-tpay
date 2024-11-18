import { useEffect, useRef, useState } from "react";
import { FormData } from "../types/FormData";
import { PassTemplate } from "../types/PassTemplate";
import ReCAPTCHA from "react-google-recaptcha";

const FormContainer = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    fullName: "",
    shippingStreet: "",
    shippingCity: "",
    shippingPostal: "",
    billingStreet: "",
    billingCity: "",
    billingPostal: "",
    companyName: "",
    nip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [needsVAT, setNeedsVAT] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState("");
  const [formStep, setFormStep] = useState(1);
  const [pageType, setPageType] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<PassTemplate | null>(
    null
  );
  const [billingAddressSameAsDelivery, setBillingAddressSameAsDelivery] =
    useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");
    const cardId = url.searchParams.get("cardID");
    const serviceId = url.searchParams.get("serviceID"); // Add this line to get serviceID

    if (type === "card-pass") {
      setPageType("card-pass");
      if (cardId) {
        fetchTemplate(cardId, serviceId); // Pass serviceId to fetchTemplate
      }
    } else if (url.pathname.includes("voucher")) {
      setPageType("voucher");
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Clear email error when typing
    if (id === "email") {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email jest wymagany";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
    }

    if (!acceptedTerms) {
      newErrors.terms = "Musisz zaakceptować regulamin i politykę prywatności";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.shippingStreet) {
      newErrors.shippingStreet = "Pole wymagane";
    }

    if (!formData.shippingCity) {
      newErrors.shippingCity = "Pole wymagane";
    }

    if (!formData.shippingPostal) {
      newErrors.shippingPostal = "Pole wymagane";
    }

    if (!billingAddressSameAsDelivery) {
      if (!formData.billingStreet) {
        newErrors.billingStreet = "Pole wymagane";
      }
      if (!formData.billingCity) {
        newErrors.billingCity = "Pole wymagane";
      }
      if (!formData.billingPostal) {
        newErrors.billingPostal = "Pole wymagane";
      }
    }

    if (needsVAT) {
      if (!formData.companyName) {
        newErrors.companyName = "Pole wymagane";
      }
      if (!formData.nip) {
        newErrors.nip = "Pole wymagane";
      } else if (!/^\d{10}$/.test(formData.nip)) {
        newErrors.nip = "NIP musi zawierać 10 cyfr";
      }
    }

    if (!paymentMethod) {
      newErrors.payment = "Wybierz metodę płatności";
    }

    setErrors(newErrors);

    // Remove errors when fields are filled
    if (formData.shippingStreet) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.shippingStreet;
        return newErrors;
      });
    }

    if (formData.shippingCity) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.shippingCity;
        return newErrors;
      });
    }

    if (formData.shippingPostal) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.shippingPostal;
        return newErrors;
      });
    }

    if (!billingAddressSameAsDelivery) {
      if (formData.billingStreet) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.billingStreet;
          return newErrors;
        });
      }
      if (formData.billingCity) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.billingCity;
          return newErrors;
        });
      }
      if (formData.billingPostal) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.billingPostal;
          return newErrors;
        });
      }
    }

    if (needsVAT) {
      if (formData.companyName) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.companyName;
          return newErrors;
        });
      }
      if (formData.nip && /^\d{10}$/.test(formData.nip)) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.nip;
          return newErrors;
        });
      }
    }

    if (paymentMethod) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.payment;
        return newErrors;
      });
    }

    return Object.keys(newErrors).length === 0;
  };

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
        "https://boscopanel.nxtm.pl/api/pass-template/list"
      );
      const templates: PassTemplate[] = await response.json();
      const template = templates.find((t) => t.id === id);
      if (template) {
        // If serviceId is provided, find the specific service
        if (serviceId) {
          const matchingService = template.services.find(
            (service) => service.service.id === serviceId
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

  const renderTitle = () => {
    if (pageType === "voucher") return "Kupujesz voucher";
    if (pageType === "card-pass") return "Kupujesz karnet";
    return "Zakup";
  };

  const formatTemplateTitle = (template: PassTemplate) => {
    if (template.services?.length > 0) {
      const service = template.services[0];
      const variantName = service.variant ? ` (${service.variant.name})` : "";
      return `Kupujesz karnet ${template.name}, ${service.units}x ${
        service.service.name
      }${variantName}, ${template.price
        .toFixed(2)
        .replace(".", ",")} zł, ważność ${template.validityDays} dni`;
    }
    return renderTitle();
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
      className="w-full cursor-pointer mb-2"
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
        <h1 className="md:hidden text-pretty mb-2 text-base leading-7 font-semibold text-gray-900 order-1">
          {formatTemplateTitle(selectedTemplate)}
        </h1>
      )}
      <div className="flex-1 order-3 md:order-1">
        {selectedTemplate ? (
          <div>
            <h1 className="hidden md:block mb-4 text-2xl font-bold">
              {renderTitle()} {selectedTemplate.name}
            </h1>

            <div className="hidden sm:grid grid-cols-1   sm:grid-cols-[min(50%,theme(spacing.80))_auto] text-sm/6">
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
                  (service) => !service.variant
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
      <div className="h-fit order-2 md:order-2 border border-gray-100 bg-gray-100 px-4 py-6 lg:min-w-[450px]">
        <div>
          <h3 className="pb-4 text-base font-semibold">Dane kontaktowe</h3>
          <div className="mb-4">
            <label className="mb-1.5 inline-block text-sm" htmlFor="fullname">
              Imię i nazwisko
            </label>
            <input
              className="w-full border border-gray-200 px-4 py-3 text-sm"
              id="fullname"
              type="text"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 inline-block text-sm" htmlFor="email">
              Adres e-mail *
            </label>
            <input
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-200"
              } px-4 py-3 text-sm`}
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="mb-1.5 inline-block text-sm" htmlFor="phone">
              Numer telefonu
            </label>
            <input
              className="w-full border border-gray-200 px-4 py-3 text-sm"
              id="phone"
              type="tel"
            />
          </div>
        </div>

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
          {isGift && (
            <div className="mb-4">
              <label
                className="mb-1.5 inline-block text-sm"
                htmlFor="gift-recipient-name"
              >
                Imię i nazwisko osoby obdarowanej
              </label>
              <input
                className="w-full border border-gray-200 px-4 py-3 text-sm"
                type="text"
                id="gift-recipient-name"
                value={giftRecipientName}
                onChange={(e) => setGiftRecipientName(e.target.value)}
              />
            </div>
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
              <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-16">
      <div className="flex-1">
        <div className="border border-gray-200 px-4 py-6 h-fit">
          <h6 className="mb-4 text-center text-lg font-semibold">
            Adres do wysyłki
          </h6>
          <div className="mb-4">
            <label
              className="mb-1.5 inline-block text-sm"
              htmlFor="shipping-street"
            >
              Ulica i numer domu *
            </label>
            <input
              className={`w-full border ${
                errors.shippingStreet ? "border-red-500" : "border-gray-200"
              } px-4 py-3 text-sm`}
              id="shippingStreet"
              type="text"
              value={formData.shippingStreet}
              onChange={handleInputChange}
            />
            {errors.shippingStreet && (
              <p className="text-red-500 text-xs mt-1">
                {errors.shippingStreet}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-1.5 inline-block text-sm"
              htmlFor="shippingCity"
            >
              Miasto *
            </label>
            <input
              className={`w-full border ${
                errors.shippingCity ? "border-red-500" : "border-gray-200"
              } px-4 py-3 text-sm`}
              id="shippingCity"
              type="text"
              value={formData.shippingCity}
              onChange={handleInputChange}
            />
            {errors.shippingCity && (
              <p className="text-red-500 text-xs mt-1">{errors.shippingCity}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="mb-1.5 inline-block text-sm"
              htmlFor="shippingPostal"
            >
              Kod pocztowy *
            </label>
            <input
              className={`w-full border ${
                errors.shippingPostal ? "border-red-500" : "border-gray-200"
              } px-4 py-3 text-sm`}
              id="shippingPostal"
              type="text"
              value={formData.shippingPostal}
              onChange={handleInputChange}
            />
            {errors.shippingPostal && (
              <p className="text-red-500 text-xs mt-1">
                {errors.shippingPostal}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={billingAddressSameAsDelivery}
                onChange={(e) =>
                  setBillingAddressSameAsDelivery(e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="text-sm">
                Adres rozliczeniowy taki sam jak adres dostawy
              </span>
            </label>
          </div>

          {!billingAddressSameAsDelivery && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h6 className="mb-4 text-center text-lg font-semibold">
                Adres rozliczeniowy
              </h6>
              <div className="mb-4">
                <label
                  className="mb-1.5 inline-block text-sm"
                  htmlFor="billing-street"
                >
                  Ulica i numer domu *
                </label>
                <input
                  className={`w-full border ${
                    errors.billingStreet ? "border-red-500" : "border-gray-200"
                  } px-4 py-3 text-sm`}
                  id="billingStreet"
                  type="text"
                  value={formData.billingStreet}
                  onChange={handleInputChange}
                />
                {errors.billingStreet && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.billingStreet}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 inline-block text-sm"
                  htmlFor="billingCity"
                >
                  Miasto
                </label>
                <input
                  className={`w-full border ${
                    errors.billingCity ? "border-red-500" : "border-gray-200"
                  } px-4 py-3 text-sm`}
                  id="billingCity"
                  type="text"
                  value={formData.billingCity}
                  onChange={handleInputChange}
                />
                {errors.billingCity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.billingCity}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 inline-block text-sm"
                  htmlFor="billingPostal"
                >
                  Kod pocztowy
                </label>
                <input
                  className={`w-full border ${
                    errors.billingPostal ? "border-red-500" : "border-gray-200"
                  } px-4 py-3 text-sm`}
                  id="billingPostal"
                  type="text"
                  value={formData.billingPostal}
                  onChange={handleInputChange}
                />
                {errors.billingPostal && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.billingPostal}
                  </p>
                )}
              </div>
            </div>
          )}

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
                    Nazwa firmy *
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.companyName}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="mb-1.5 inline-block text-sm" htmlFor="nip">
                    NIP *
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
                    <p className="text-red-500 text-xs mt-1">{errors.nip}</p>
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
            Rodzaj płatności
          </h3>
          <PaymentOption method="blik" label="Blik" imageSrc="blik.svg" />
          <PaymentOption method="tpay" label="Tpay" imageSrc="tpay_logo.svg" />
          {errors.payment && (
            <p className="text-red-500 text-xs mt-1">{errors.payment}</p>
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
        <div className=" grid grid-cols-1   sm:grid-cols-[min(50%,theme(spacing.80))_auto] text-sm/6">
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Nazwa
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950  sm:border-zinc-950/5 border-t-0 sm:py-3">
            {selectedTemplate.name}
          </dd>
          <dt className="col-start-1 border-t border-zinc-950/5 pt-3 text-zinc-500 first:border-none sm:border-t sm:border-zinc-950/5 sm:py-3">
            Cena
          </dt>
          <dd className="sm:[&amp;:nth-child(2)]:border-none pb-3 pt-1 text-zinc-950 sm:border-t sm:border-zinc-950/5 sm:py-3">
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
      <button
        onClick={handleSubmitForm}
        className="mt-6 w-full bg-gray-900 px-7 py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Potwierdź i zapłać
      </button>
    </div>
  );

  const handleSubmitForm = async () => {
    if (captchaToken) {
      // Verify captcha token on your backend
      try {
        const response = await fetch("/api/verify-captcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ captchaToken }),
        });

        if (response.ok) {
          // Process form submission
          // ...
        } else {
          setErrors((prev) => ({
            ...prev,
            captcha: "Weryfikacja nie powiodła się. Spróbuj ponownie.",
          }));
          // Reset captcha
          recaptchaRef.current?.reset();
          setCaptchaToken(null);
        }
      } catch (error) {
        console.error("Error verifying captcha:", error);
        setErrors((prev) => ({
          ...prev,
          captcha: "Wystąpił błąd. Spróbuj ponownie później.",
        }));
      }
    }
  };

  return (
    <section className="pb-16 sm:pt-9 pt-6">
      <div className="mx-auto max-w-6xl px-4">
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
                  Adres i rodzaj płatności
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

        {formStep === 1 && renderFirstStep()}
        {formStep === 2 && renderBillingAddress()}
        {formStep === 3 && renderSummary()}
      </div>
    </section>
  );
};

export default FormContainer;
