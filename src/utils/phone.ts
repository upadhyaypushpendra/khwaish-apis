import phone, { PhoneResult } from "phone";

const country = "IN";

/**
 *
 * @param phoneNumber Phone number to be validated and parsed
 * @returns Parsed phone number
 */
export const validateAndParsePhone = (phoneNumber: string): PhoneResult => {
  return phone(phoneNumber, { country });
};
