
'use strict';

const router = require('express').Router();
const { charges, idempotency, nextChargeId } = require('../store');

router.post('/', (req, res) => {
  // Get the idempotency key from request headers
  const key = req.headers['idempotency-key'];

  // Rule 1: Reject requests without an idempotency key
  if (!key) {
    return res.status(400).json({
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required'
      }
    });
  }

  // Rule 2: Return the saved response for repeated requests
  if (idempotency.has(key)) {
    const saved = idempotency.get(key);

    return res.status(saved.status).json(saved.body);
  }

  // Rule 3: Create a new charge for a new key
  const amount = req.body && req.body.amount;

  const charge = {
    id: nextChargeId(),
    amount,
    status: 'charged'
  };

  charges.push(charge);

  // Store the complete response
  const body = {
    id: charge.id,
    amount: charge.amount,
    status: charge.status
  };

  const status = 201;

  idempotency.set(key, {
    status,
    body
  });

  // Return the response
  return res.status(status).json(body);
});

module.exports = router;
