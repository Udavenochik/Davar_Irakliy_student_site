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
app.use(express.static(path.join(__dirname)));

const escapeHtml = (value = '') =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.post('/contact', async (req, res) => {
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

    res.redirect('/submissions');
  } catch (error) {
    res.status(400).send(`Ошибка сохранения данных: ${escapeHtml(error.message)}`);
  }
});

app.get('/submissions', async (req, res) => {
  try {
    const submissions = await Contact.find().sort({ createdAt: -1 }).lean();

    const items = submissions
      .map(
        (item) => `
          <article class="main-article" style="margin-bottom:20px;">
            <h3>${escapeHtml(item.surname)} ${escapeHtml(item.name)} ${escapeHtml(item.patronymic || '')}</h3>
            <p><strong>Email:</strong> ${escapeHtml(item.email)}</p>
            <p><strong>Телефон:</strong> ${escapeHtml(item.phone || '—')}</p>
            <p><strong>Статус:</strong> ${escapeHtml(item.status)}</p>
            <p><strong>Факультет:</strong> ${escapeHtml(item.faculty || '—')}</p>
            <p><strong>Сообщение:</strong> ${escapeHtml(item.message)}</p>
            <p><small>Отправлено: ${new Date(item.createdAt).toLocaleString('ru-RU')}</small></p>
          </article>
        `
      )
      .join('');

    res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Заявки из формы</title>
  <link rel="stylesheet" href="/Irakliy.css" />
</head>
<body>
  <div id="page-wrapper">
    <header class="main-header">
      <h1>Полученные заявки</h1>
      <p class="student-name">Данные из MongoDB</p>
    </header>
    <nav class="main-nav">
      <ul>
        <li><a href="/">Главная</a></li>
        <li><a href="/contact">Обратная связь</a></li>
        <li><a href="/submissions">Заявки</a></li>
      </ul>
    </nav>
    <main>
      ${items || '<p>Пока нет заявок. Заполните форму обратной связи.</p>'}
    </main>
  </div>
</body>
</html>`);
  } catch (error) {
    res.status(500).send(`Ошибка чтения данных: ${escapeHtml(error.message)}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
