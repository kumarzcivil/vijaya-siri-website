import { body, param } from 'express-validator';

export const offerValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Subtitle cannot exceed 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
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
  body('badge')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Badge cannot exceed 50 characters'),
  body('color')
    .optional()
    .trim(),
];

export const offerIdParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
