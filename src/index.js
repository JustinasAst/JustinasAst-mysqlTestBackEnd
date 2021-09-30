const express = require('express');
const cors = require('cors');
const auth = require('./routes/v1/auth');
const accounts = require('./routes/v1/accounts');
const { port } = require('./config');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/v1/auth', auth);
app.use('/v1/accounts', accounts);
app.get('/', (req, res) => {
  res.send({ msq: 'everything is fine' });
});
app.all('*', (req, res) => {
  res.status(404).send({ msq: 'Page not exsist' });
});
app.listen(port, () => 'Server is running on port 3000');
