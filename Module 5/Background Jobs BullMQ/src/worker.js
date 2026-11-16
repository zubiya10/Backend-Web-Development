
'use strict';

const { Worker } = require('bullmq');
const { connection } = require('./queue');
const { transporter } = require('./email');

const worker = new Worker(
  'email',
  async (job) => {
    if (job.name === 'otp') {
      await transporter.sendMail({
        from: process.env.SMTP_USER || 'no-reply@example.com',
        to: job.data.to,
        subject: 'Your Email Verification OTP',
        text: `Your OTP is ${job.data.otp}. It is valid for 10 minutes.`,
      });
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job ? job.id : 'unknown'} failed: ${err.message}`);
});

module.exports = { worker };
