const express = require('express');
const router = express.Router();

const PACKAGES = {
  10: { name: 'Starter Pack', lessons: 10, displayPrice: 'USD 1,599', ibpAvailable: true,  achAvailable: false },
  70: { name: 'Pro Pack',     lessons: 70, displayPrice: 'USD 7,999', ibpAvailable: false, achAvailable: true  },
};

router.get('/', (req, res) => {
  res.render('book-class', { title: 'Book Class', activePage: 'book-class' });
});

router.get('/payment', (req, res) => {
  const pkg = PACKAGES[req.query.package] || PACKAGES[10];
  const packageKey = req.query.package === '70' ? '70' : '10';
  res.render('payment', {
    title: 'Select Payment',
    activePage: 'book-class',
    pkg,
    packageKey,
  });
});

router.get('/confirmed', (req, res) => {
  const sessionId = req.query.session_id || null;
  res.render('book-class-confirmed', {
    title: 'Book Class',
    activePage: 'book-class',
    sessionId,
  });
});

module.exports = router;
