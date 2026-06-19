(async () => {
  const stripe = Stripe(publishableKey);

  // Create the PaymentIntent upfront so Stripe reads payment_method_types
  // from the PI and renders only those methods in the Payment Element.
  let clientSecret;
  try {
    const res = await fetch('/checkout/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package: selectedPackage, method: selectedMethod }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    clientSecret = data.clientSecret;
  } catch (err) {
    document.getElementById('checkout-loading').innerHTML = `
      <p style="color:#FF3B30;font-size:13px;">Failed to load payment form: ${err.message}</p>
      <a href="/book-class" style="color:#6B5ECD;font-size:13px;font-weight:600;margin-top:8px;display:inline-block;">← Back to Book Class</a>
    `;
    return;
  }

  // Immediate pattern: clientSecret tells Stripe which payment_method_types
  // are allowed. Additionally suppress Link as a wallet overlay on non-IBP
  // methods, since IBP is already its own separate checkout flow.
  const elements = stripe.elements({ clientSecret });

  const paymentElement = elements.create('payment', {
    layout: { type: 'accordion' },
    wallets: {
      link: selectedMethod === 'ibp' ? 'auto' : 'never',
    },
  });
  paymentElement.mount('#payment-element');

  paymentElement.on('ready', () => {
    document.getElementById('checkout-loading').style.display = 'none';
    document.getElementById('payment-form').style.display = 'block';
  });

  document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    const submitLabel = document.getElementById('submit-label');
    const submitSpinner = document.getElementById('submit-spinner');
    const errorsEl = document.getElementById('payment-errors');

    submitBtn.disabled = true;
    submitLabel.style.display = 'none';
    submitSpinner.style.display = 'inline-block';
    errorsEl.style.display = 'none';

    // With the immediate pattern, clientSecret is already in the Elements
    // instance — just confirm, no need to pass it again.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book-class/confirmed`,
      },
    });

    if (error) {
      errorsEl.textContent = error.message;
      errorsEl.style.display = 'block';
      submitBtn.disabled = false;
      submitLabel.style.display = 'inline';
      submitSpinner.style.display = 'none';
    }
  });
})();
