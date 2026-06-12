const express = require('express');
const app = express();
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Mock POST route
app.post('/api/meetings', (req, res) => {
  const { participantEmail, title, startTime, endTime } = req.body;
  if (!participantEmail || !title || !startTime || !endTime) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  res.status(200).json({ message: 'Success' });
});

app.listen(5003, () => console.log('Test server running on 5003'));
