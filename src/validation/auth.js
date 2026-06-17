/**
 * Auth validation schemas — adapted from mobile's auth.ts
 * Uses Yup for form validation with react-hook-form
 */
import * as Yup from 'yup';

// Regex patterns
export const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(in|com|org|net)$/;
export const mobileRegex = /^[0-9]{10}$/;

/**
 * Shared validation messages
 */
const messages = {
  required: (field) => `${field} is required`,
  invalidEmail: 'Provide a valid Email ID',
  invalidMobile: 'Mobile number must be 10 digits',
};

/**
 * Sign-in form schema
 */
export const signinFormSchema = Yup.object({
  email: Yup.string()
    .trim()
    .required(messages.required('Email'))
    .matches(emailRegex, messages.invalidEmail),
  password: Yup.string()
    .trim()
    .required(messages.required('Password')),
});

/**
 * Signup form schema
 */
export const signupFormOneSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(messages.required('Full Name')),
  email: Yup.string()
    .trim()
    .required(messages.required('Email'))
    .matches(emailRegex, messages.invalidEmail),
  password: Yup.string()
    .trim()
    .required(messages.required('Password'))
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .trim()
    .required(messages.required('Confirm Password'))
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

/**
 * Central export for all schemas
 */
export const Schemas = {
  signinFormSchema,
  signupFormOneSchema,
};
