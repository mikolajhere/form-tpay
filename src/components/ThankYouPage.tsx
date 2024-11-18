/* eslint-disable @typescript-eslint/no-explicit-any */
export const ThankYouPage = ({
  formData,
  selectedTemplate,
  voucherValue,
}: any) => (
  <Card className="mx-auto max-w-2xl">
    <CardHeader>
      <CardTitle className="text-center text-2xl">
        Dziękujemy za dokonanie zakupu!
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold">Podsumowanie zamówienia:</h3>
          {selectedTemplate ? (
            <div className="space-y-2">
              <p>Produkt: {selectedTemplate.name}</p>
              <p>Cena: {selectedTemplate.price.toFixed(2)} zł</p>
              <p>Ważność: {selectedTemplate.validityDays} dni</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Voucher o wartości: {voucherValue} zł</p>
            </div>
          )}
          <div className="mt-4 space-y-2">
            <p>
              Imię i nazwisko: {formData.name} {formData.surname}
            </p>
            <p>Email: {formData.email}</p>
            <p>Telefon: {formData.phone}</p>
            {formData.giftRecipientName && (
              <p>Osoba obdarowana: {formData.giftRecipientName}</p>
            )}
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          Szczegóły zamówienia zostały wysłane na podany adres email.
        </div>
      </div>
    </CardContent>
  </Card>
);

const CardHeader = ({ children }: any) => (
  <div className="bg-gray-50 p-6">{children}</div>
);

const CardTitle = ({ children, className }: any) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const Card = ({ children, className }: any) => (
  <div className={`rounded-lg bg-white shadow-lg ${className}`}>{children}</div>
);

const CardContent = ({ children }: any) => (
  <div className="p-6">{children}</div>
);
