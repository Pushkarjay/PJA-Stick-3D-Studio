const Joi = require('joi');

// Product validation schema
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  category: Joi.string()
    .valid('stickers', 'banners', 'signboards', 't-shirts', '3d-printing')
    .required(),
  priceTier: Joi.string()
    .valid('₹0-50', '₹50-500', '₹500-5000', '₹5000+')
    .required(),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
  productionTime: Joi.string()
    .valid('1-2 days', '3-5 days', '1-2 weeks')
    .required(),
  material: Joi.string().required(),
  stockStatus: Joi.string()
    .valid('In Stock', 'Low Stock', 'Out of Stock')
    .required(),
  imageUrl: Joi.string().uri().required(),
  isActive: Joi.boolean().optional(),
});

// Order validation schema
const orderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required(),
  customerEmail: Joi.string().email().required(),
  customerPhone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 digits',
    }),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        productName: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        priceTier: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  notes: Joi.string().max(500).optional().allow(''),
});

// Order status update validation schema
const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')
    .required(),
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.reduce((acc, detail) => {
        acc[detail.path[0]] = detail.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors,
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validateProduct: validate(productSchema),
  validateOrder: validate(orderSchema),
  validateOrderStatus: validate(orderStatusSchema),
};
