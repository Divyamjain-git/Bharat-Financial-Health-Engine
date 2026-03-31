/**
 * Request Validation Middleware using Joi
 */

const Joi = require('joi');

// ─── Validation Schemas ────────────────────────────────────────────────────────

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    // Only 'salaried' and 'business' are valid registration roles.
    // Admin accounts must be created directly in the database — not through this endpoint.
    role: Joi.string().valid('salaried', 'business').required(),
    phone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().allow('')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  financialProfile: Joi.object({
    netMonthlySalary: Joi.number().min(0).default(0),
    annualBonus: Joi.number().min(0).default(0),
    otherMonthlyIncome: Joi.number().min(0).default(0),
    last12MonthRevenue: Joi.array().items(Joi.number().min(0)).max(12).default([]),
    avgMonthlyProfit: Joi.number().min(0).default(0),
    expenses: Joi.object({
      houseRent: Joi.number().min(0).default(0),
      groceries: Joi.number().min(0).default(0),
      electricityBill: Joi.number().min(0).default(0),
      gasBill: Joi.number().min(0).default(0),
      waterBill: Joi.number().min(0).default(0),
      internetMobile: Joi.number().min(0).default(0),
      medicalExpenses: Joi.number().min(0).default(0),
      vehicleFuel: Joi.number().min(0).default(0),
      schoolFees: Joi.number().min(0).default(0),
      otherExpenses: Joi.number().min(0).default(0)
    }).default({}),
    emergencyFundAmount: Joi.number().min(0).default(0),
    creditCards: Joi.array().items(Joi.object({
      cardName: Joi.string().default('Credit Card'),
      creditLimit: Joi.number().min(0).required(),
      outstandingBalance: Joi.number().min(0).required()
    })).default([]),
    monthlySavings: Joi.number().min(0).default(0)
  }),

  loan: Joi.object({
    loanType: Joi.string().valid('personal', 'home', 'vehicle', 'education', 'business', 'gold', 'other').required(),
    lenderName: Joi.string().max(100).default('Bank/NBFC'),
    principalAmount: Joi.number().min(0).required(),
    outstandingBalance: Joi.number().min(0).required(),
    monthlyEMI: Joi.number().min(0).required(),
    interestRate: Joi.number().min(0).max(100).required(),
    remainingMonths: Joi.number().min(0).optional().allow(null)
  })
};

// ─── Middleware Factory ────────────────────────────────────────────────────────
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const messages = error.details.map(d => d.message).join('. ');
      return res.status(400).json({ success: false, message: messages });
    }

    req.body = value;
    next();
  };
};

module.exports = { validate };
