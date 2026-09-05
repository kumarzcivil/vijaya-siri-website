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
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('startingPrice')
    .optional()
    .trim(),
  body('unit')
    .optional()
    .trim(),
  body('included')
    .optional()
    .isArray(),
  body('notes')
    .optional()
    .isArray(),
  body('siteVisitCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Site visit charge must be non-negative'),
  body('siteVisitWaiver')
    .optional()
    .isObject(),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be boolean'),
  body('pricing')
    .optional()
    .isObject(),
  body('pricing.mode')
    .optional()
    .isIn(['custom', 'area_rate', 'quantity_rate', 'fixed'])
    .withMessage('Invalid pricing mode'),
];

export const bannerValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('eyebrow')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Eyebrow cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
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
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be non-negative integer'),
  body('startDate')
    .optional()
    .trim(),
  body('endDate')
    .optional()
    .trim(),
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
