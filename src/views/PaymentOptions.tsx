import React from "react";

interface PaymentMethodsProps {
  onSelect: (id: string) => void;
  selectedMethod: string;
  disabled?: boolean;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  onSelect,
  selectedMethod,
  disabled = false,
}) => {
  const paymentGroups = [
    {
      id: "150",
      name: "BLIK",
      channels: "64",
      logoUrl: "https://secure.tpay.com/_/g/150.png",
    },
    {
      id: "102",
      name: "Bank Pekao SA",
      channels: "4,47,55",
      logoUrl: "https://secure.tpay.com/_/g/102.png",
    },
    {
      id: "108",
      name: "PKO Bank Polski",
      channels: "21",
      logoUrl: "https://secure.tpay.com/_/g/108.png",
    },
    {
      id: "110",
      name: "Inteligo",
      channels: "14",
      logoUrl: "https://secure.tpay.com/_/g/110.png",
    },
    {
      id: "160",
      name: "mBank",
      channels: "18",
      logoUrl: "https://secure.tpay.com/_/g/160.png",
    },
    {
      id: "111",
      name: "ING Bank Śląski SA",
      channels: "13",
      logoUrl: "https://secure.tpay.com/_/g/111.png",
    },
    {
      id: "114",
      name: "Bank Millennium SA",
      channels: "2,48",
      logoUrl: "https://secure.tpay.com/_/g/114.png",
    },
    {
      id: "115",
      name: "Santander Bank Polska SA",
      channels: "6",
      logoUrl: "https://secure.tpay.com/_/g/115.png",
    },
    {
      id: "132",
      name: "Citibank Handlowy SA",
      channels: "7",
      logoUrl: "https://secure.tpay.com/_/g/132.png",
    },
    {
      id: "116",
      name: "Credit Agricole Polska SA",
      channels: "17",
      logoUrl: "https://secure.tpay.com/_/g/116.png",
    },
    {
      id: "119",
      name: "Velo Bank",
      channels: "12",
      logoUrl: "https://secure.tpay.com/_/g/119.png",
    },
    {
      id: "124",
      name: "Bank Pocztowy SA",
      channels: "5",
      logoUrl: "https://secure.tpay.com/_/g/124.png",
    },
    {
      id: "135",
      name: "Banki Spółdzielcze",
      channels: "42,63",
      logoUrl: "https://secure.tpay.com/_/g/135.png",
    },
    {
      id: "133",
      name: "BNP Paribas Bank Polska SA",
      channels: "1",
      logoUrl: "https://secure.tpay.com/_/g/133.png",
    },
    {
      id: "159",
      name: "Bank Nowy",
      channels: "24",
      logoUrl: "https://secure.tpay.com/_/g/159.png",
    },
    {
      id: "130",
      name: "Nest Bank",
      channels: "26",
      logoUrl: "https://secure.tpay.com/_/g/130.png",
    },
    {
      id: "145",
      name: "Plus Bank SA",
      channels: "15",
      logoUrl: "https://secure.tpay.com/_/g/145.png",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {paymentGroups.map((group) => (
        <div key={group.id} className="relative">
          <input
            type="radio"
            id={`payment-${group.id}`}
            name="payment-method"
            value={group.id}
            checked={selectedMethod === group.id}
            onChange={() => onSelect(group.id)}
            className="peer absolute h-0 w-0 opacity-0"
            disabled={disabled}
          />
          <label
            htmlFor={`payment-${group.id}`}
            className={`block cursor-pointer overflow-hidden   border-2 p-2 sm:p-3 transition-all hover:border-gray-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 ${disabled ? "opacity-50" : ""} ${selectedMethod === group.id ? "border-blue-500 bg-blue-50" : "border-gray-200"} `}
          >
            <div className="flex aspect-[3/2] items-center justify-center">
              <img
                src={group.logoUrl}
                alt={group.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* <div className="mt-2 text-center text-sm font-medium text-gray-900">
              {group.name}
            </div> */}
          </label>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethods;
