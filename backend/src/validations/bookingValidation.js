import { body, param } from 'express-validator';

export const bookingValidation = [
  body('kind')
    .trim()
    .notEmpty()
    .withMessage('Booking kind is required')
    .isIn(['quick-fix', 'pro-fix'])
    .withMessage('Kind must be quick-fix or pro-fix'),
  body('serviceId')
    .trim()
    .notEmpty()
    .withMessage('Service ID is required'),
  body('serviceName')
    .trim()
    .notEmpty()
    .withMessage('Service name is required'),
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('customerMobile')
    .trim()
    .notEmpty()
    .withMessage('Customer mobile is required')
    .matches(/^\d{10}$/)
    .withMessage('Mobile must be 10 digits'),
];

export const bookingStatusValidation = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['upcoming', 'completed', 'cancelled'])
    .withMessage('Status must be upcoming, completed, or cancelled'),
];

export const bookingIdParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
