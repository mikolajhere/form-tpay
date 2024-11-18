import { PassTemplate } from "../types/PassTemplate";
import { renderTitle } from "./renderTitle";

export const formatTemplateTitle = (template: PassTemplate) => {
  if (template.services?.length > 0) {
    const service = template.services[0];
    const variantName = service.variant ? ` (wariant: ${service.variant.name})` : "";
    return `Kupujesz karnet „${template.name}”; ${service.units}x ${
      service.service.name
    }${variantName}; ${template.price
      .toFixed(2)
      .replace(".", ",")} zł; ważność ${template.validityDays} dni`;
  }
  return renderTitle(template.type === "voucher" ? "voucher" : "card-pass");
};
