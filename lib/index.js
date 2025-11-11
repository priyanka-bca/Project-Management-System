const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
require('./db'); // initialize DB

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', authRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
