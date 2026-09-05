import { body, param } from 'express-validator';

export const packageValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Package name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('pricePerSqFt')
    .isNumeric()
    .withMessage('Price per sq.ft is required')
    .custom((v) => v >= 0)
    .withMessage('Price cannot be negative'),
  body('tagline')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Tagline cannot exceed 300 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be non-negative integer'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be boolean'),
  body('specs')
    .optional()
    .isArray()
    .withMessage('Specs must be an array'),
];

export const idParamValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
