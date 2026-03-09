const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_site';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

const contactSchema = new mongoose.Schema(
  {
    surname: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    patronymic: { type: String, trim: true, default: '' },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    status: { type: String, required: true, trim: true },
    faculty: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

app.get('/', (req, res) => {
  res.redirect('/index.html');
});

app.get('/contact', (req, res) => {
  res.redirect('/contact.html');
});

app.get('/submissions', (req, res) => {
  res.redirect('/submissions.html');
});

app.post('/api/contact', async (req, res) => {
  try {
    await Contact.create({
      surname: req.body.surname,
      name: req.body.name,
      patronymic: req.body.patronymic,
      email: req.body.email,
      phone: req.body.phone,
      status: req.body.status,
      faculty: req.body.faculty,
      message: req.body.message
    });

    res.redirect('/submissions.html');
  } catch (error) {
    res.status(400).send(`Ошибка сохранения данных: ${escapeHtml(error.message)}`);
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: `Ошибка чтения данных: ${escapeHtml(error.message)}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
