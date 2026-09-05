import { body, param } from 'express-validator';

export const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('icon')
    .trim()
    .notEmpty()
    .withMessage('Icon is required'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be boolean'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be non-negative integer'),
];

export const serviceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Short description cannot exceed 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('includedItems')
    .optional()
    .isArray(),
  body('notes')
    .optional()
    .isArray(),
  body('pricing')
    .optional()
    .isObject(),
  body('pricing.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be non-negative'),
  body('duration')
    .optional()
    .isObject(),
  body('duration.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Duration value must be non-negative'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be boolean'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be boolean'),
  body('bookingConfiguration')
    .optional()
    .isObject(),
];

export const bannerValidation = [
  body('internalName')
    .trim()
    .notEmpty()
    .withMessage('Internal name is required')
    .isLength({ max: 200 })
    .withMessage('Internal name cannot exceed 200 characters'),
  body('startDate')
    .trim()
    .notEmpty()
    .withMessage('Start date is required'),
  body('endDate')
    .trim()
    .notEmpty()
    .withMessage('End date is required'),
  body('ctaLabel')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('CTA label cannot exceed 50 characters'),
  body('destinationType')
    .optional()
    .isIn(['none', 'service', 'category', 'external'])
    .withMessage('Invalid destination type'),
  body('destination')
    .optional()
    .trim(),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be boolean'),
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
