
'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  // Verify the signature header
  const signature = req.headers['x-webhook-signature'];

  if (!signature || !signature.startsWith('sha256=')) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  const received = signature.slice(7);

  if (!/^[a-f0-9]{64}$/i.test(received)) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  // Calculate HMAC using the raw request body
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  // Compare signatures safely
  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(received, 'hex')
  );

  if (!valid) {
    return res.status(401).json({
      error: 'Invalid signature'
    });
  }

  // Parse the event after verification
  const event = JSON.parse(req.body.toString());

  // Check for duplicate event IDs
  if (_processedIds.has(event.id)) {
    return res.status(200).json({
      status: 'already_processed'
    });
  }

  // Mark the event as processed
  _processedIds.add(event.id);

  // Acknowledge immediately
  res.status(200).json({
    status: 'received'
  });

  // Process after sending the response
  setImmediate(() => {
    Promise.resolve(handleEvent(event)).catch(console.error);
  });
}

module.exports = {
  handleWebhook,
  _processedIds
};
