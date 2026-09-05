import { body, param } from 'express-validator';

export const statValidation = [
  body('value')
    .trim()
    .notEmpty()
    .withMessage('Value is required')
    .isLength({ max: 50 })
    .withMessage('Value cannot exceed 50 characters'),
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Label is required')
    .isLength({ max: 100 })
    .withMessage('Label cannot exceed 100 characters'),
  body('icon')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be non-negative integer'),
];

export const serviceValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subtitle cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('icon')
    .optional()
    .trim(),
  body('ctaLabel')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('CTA label cannot exceed 50 characters'),
  body('ctaTarget')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('CTA target cannot exceed 500 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be non-negative integer'),
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
