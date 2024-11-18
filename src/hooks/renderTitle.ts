export const renderTitle = (pageType?: string) => {
  if (pageType === "voucher") return "Kupujesz voucher";
  if (pageType === "card-pass") return "Kupujesz karnet";
  return "Kupujesz";
};
