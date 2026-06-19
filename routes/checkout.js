const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
});

const CARD_SURCHARGE = 0.03;

const PACKAGES = {
  10: {
    name: 'Starter Pack',
    description: '10 Mandarin lessons with certified teachers',
    lessons: 10,
    unitAmount: 159900,         // USD 1,599.00
    displayPrice: 'USD 1,599.00',
    perLesson: 'USD 159.90 / lesson',
    currency: 'usd',
  },
  50: {
    name: 'Pro Pack',
    description: '50 Mandarin lessons with certified teachers',
    lessons: 50,
    unitAmount: 599900,         // USD 5,999.00
    displayPrice: 'USD 5,999.00',
    perLesson: 'USD 119.98 / lesson — save 25%',
    currency: 'usd',
  },
};

const METHOD_PAYMENT_TYPES = {
  card:    ['card'],
  ibp:     ['link'],
  ach:     ['us_bank_account'],
  alipay:  ['alipay'],
  wechat:  ['wechat_pay'],
};

function buildLineItem(pkg, isCard) {
  const unitAmount = isCard
    ? Math.round(pkg.unitAmount * (1 + CARD_SURCHARGE))
    : pkg.unitAmount;

  const dollars = (unitAmount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    unitAmount,
    displayPrice: `USD ${dollars}`,
  };
}

router.get('/', (req, res) => {
  const pkg = PACKAGES[req.query.package] || PACKAGES[10];
  const method = req.query.method || 'other';
  const isCard = method === 'card';
  const { displayPrice, unitAmount } = buildLineItem(pkg, isCard);

  res.render('checkout', {
    title: 'Checkout',
    activePage: 'book-class',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    pkg: { ...pkg, displayPrice },
    method,
    isCard,
    unitAmount,
    paymentMethodTypes: METHOD_PAYMENT_TYPES[method] || [],
  });
});

router.post('/api/create-payment-intent', async (req, res) => {
  try {
    const pkg = PACKAGES[req.body.package] || PACKAGES[10];
    const method = req.body.method;
    const isCard = method === 'card';
    const { unitAmount } = buildLineItem(pkg, isCard);

    const pmTypes = METHOD_PAYMENT_TYPES[method];
    if (!pmTypes) {
      return res.status(400).json({ error: `Unsupported payment method: ${method}` });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: unitAmount,
      currency: pkg.currency,
      payment_method_types: pmTypes,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/payment-intent-status', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.query.payment_intent);
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
