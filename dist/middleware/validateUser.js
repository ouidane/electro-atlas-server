"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const validator_1 = __importDefault(require("validator"));
const constants_1 = require("../utils/constants");
const validateUser = (req, res, next) => {
    const { familyName, givenName, phone, contactEmail, contactPhone, contactWebsite, line1, line2, postalCode, city, country, role, description, } = req.body;
    const errors = {};
    if (!familyName) {
        errors.familyName = "FamilyName is required";
    }
    else if (!validator_1.default.matches(familyName, /^[a-zA-Z\s-]+$/)) {
        errors.familyName =
            "FamilyName must contain only letters, spaces, or hyphens";
    }
    if (!givenName) {
        errors.givenName = "GivenName is required";
    }
    else if (!validator_1.default.matches(givenName, /^[a-zA-Z\s-]+$/)) {
        errors.givenName =
            "GivenName must contain only letters, spaces, or hyphens";
    }
    if (!phone) {
        errors.phone = "Phone number is required";
    }
    else if (!validator_1.default.isMobilePhone(phone, "ar-MA")) {
        errors.phone = "Invalid phone number";
    }
    if (!line1) {
        errors.line1 = "Address is required";
    }
    else if (!validator_1.default.isLength(line1, { min: 2, max: 100 })) {
        errors.line1 = "Address is too long";
    }
    if (line2 && !validator_1.default.isLength(line2, { min: 2, max: 100 })) {
        errors.line2 = "Address is too long";
    }
    if (!postalCode) {
        errors.postalCode = "Postal code is required";
    }
    else if (!validator_1.default.isPostalCode(postalCode, "MA")) {
        errors.postalCode = "Invalid postal code";
    }
    if (!city) {
        errors.city = "City is required";
    }
    else if (!validator_1.default.isLength(city, { min: 2, max: 100 })) {
        errors.city = "City must be between 2 and 100 characters";
    }
    if (!country) {
        errors.country = "Country is required";
    }
    else if (!validator_1.default.isLength(country, { min: 2, max: 100 })) {
        errors.country = "Country must be between 2 and 100 characters";
    }
    if (contactEmail && !validator_1.default.isEmail(contactEmail)) {
        errors.contactEmail = "Invalid contact email";
    }
    if (contactPhone && !validator_1.default.isMobilePhone(contactPhone, "ar-MA")) {
        errors.contactPhone = "Invalid contact phone number";
    }
    if (contactWebsite && !validator_1.default.isURL(contactWebsite)) {
        errors.contactWebsite = "Invalid contact website URL";
    }
    if (description && !validator_1.default.isLength(description, { min: 2, max: 200 })) {
        errors.description = "Description must be between 2 and 200 characters";
    }
    const allowedRoles = Object.values(constants_1.ROLE);
    if (role && !allowedRoles.includes(role)) {
        errors.role = "Invalid role";
    }
    if (Object.keys(errors).length > 0) {
        throw new errors_1.ValidationError("Validation failed", errors);
    }
    next();
};
exports.default = validateUser;
//# sourceMappingURL=validateUser.js.map