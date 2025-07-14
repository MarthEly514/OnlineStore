require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY.trim());

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public',{
  maxAge: '1y',
  immutable: true,
})); 

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }

    console.log('Creating checkout with:', items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items,
      success_url: 'http://localhost:3000/success.html'.trim(),
      cancel_url: 'http://localhost:3000/cancel.html'.trim(),
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe Error:', err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('🟢 Server on http://localhost:3000'));
