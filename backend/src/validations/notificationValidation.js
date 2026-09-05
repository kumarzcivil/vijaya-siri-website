import { body, param } from 'express-validator';

export const notificationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['booking', 'quote', 'service', 'account', 'system', 'offer'])
    .withMessage('Invalid category'),
  body('customerId')
    .optional()
    .trim(),
];

export const notificationIdParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
