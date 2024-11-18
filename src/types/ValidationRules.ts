export interface ValidationRules {
  field: string;
  maxLength: number;
  pattern?: RegExp;
  required: boolean;
  description: string;
}
