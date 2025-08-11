// Simple PII scrubbing for prompts: masks emails, phones, CPFs, names if passed separately
export function scrubPII(input: string): string {
  let out = input;
  out = out.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]");
  out = out.replace(/\+?\d[\d\s().-]{7,}\d/g, "[PHONE]");
  out = out.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF]");
  return out;
}


