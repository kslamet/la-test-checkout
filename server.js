require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const indexRouter = require('./routes/index');
const bookingRouter = require('./routes/booking');
const checkoutRouter = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/book-class', bookingRouter);
app.use('/checkout', checkoutRouter);

app.listen(PORT, () => {
  console.log(`LingoAce demo running at http://localhost:${PORT}`);
});

module.exports = app;
