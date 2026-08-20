const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.json({ message: 'To-Do API Kusursuz Calisiyor' });
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda dinleniyor...`);
});
