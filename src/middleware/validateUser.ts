import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors";
import validator, { PostalCodeLocale } from "validator";
import { ROLE } from "../utils/constants";

const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    familyName,
    givenName,
    phone,
    contactEmail,
    contactPhone,
    contactWebsite,
    line1,
    line2,
    postalCode,
    city,
    country,
    role,
    description,
  } = req.body;

  const errors: { [key: string]: string } = {};

  if (!familyName) {
    errors.familyName = "FamilyName is required";
  } else if (!validator.matches(familyName, /^[a-zA-Z\s-]+$/)) {
    errors.familyName =
      "FamilyName must contain only letters, spaces, or hyphens";
  }

  if (!givenName) {
    errors.givenName = "GivenName is required";
  } else if (!validator.matches(givenName, /^[a-zA-Z\s-]+$/)) {
    errors.givenName =
      "GivenName must contain only letters, spaces, or hyphens";
  }

  if (!phone) {
    errors.phone = "Phone number is required";
  } else if (!validator.isMobilePhone(phone, "ar-MA")) {
    errors.phone = "Invalid phone number";
  }

  if (!line1) {
    errors.line1 = "Address is required";
  } else if (!validator.isLength(line1, { min: 2, max: 100 })) {
    errors.line1 = "Address is too long";
  }

  if (line2 && !validator.isLength(line2, { min: 2, max: 100 })) {
    errors.line2 = "Address is too long";
  }

  if (!postalCode) {
    errors.postalCode = "Postal code is required";
  } else if (!validator.isPostalCode(postalCode, "MA" as PostalCodeLocale)) {
    errors.postalCode = "Invalid postal code";
  }

  if (!city) {
    errors.city = "City is required";
  } else if (!validator.isLength(city, { min: 2, max: 100 })) {
    errors.city = "City must be between 2 and 100 characters";
  }

  if (!country) {
    errors.country = "Country is required";
  } else if (!validator.isLength(country, { min: 2, max: 100 })) {
    errors.country = "Country must be between 2 and 100 characters";
  }

  if (contactEmail && !validator.isEmail(contactEmail)) {
    errors.contactEmail = "Invalid contact email";
  }

  if (contactPhone && !validator.isMobilePhone(contactPhone, "ar-MA")) {
    errors.contactPhone = "Invalid contact phone number";
  }

  if (contactWebsite && !validator.isURL(contactWebsite)) {
    errors.contactWebsite = "Invalid contact website URL";
  }

  if (description && !validator.isLength(description, { min: 2, max: 200 })) {
    errors.description = "Description must be between 2 and 200 characters";
  }

  const allowedRoles = Object.values(ROLE);
  if (role && !allowedRoles.includes(role)) {
    errors.role = "Invalid role";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export default validateUser;
