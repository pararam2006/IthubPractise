const fs = require("fs");
const express = require("express");
const path = require("path");
const axios = require("axios"); // Подключаем axios для выполнения запросов
const app = express();

let data = fs.readFileSync('data.json');
const linksObject = JSON.parse(data);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Для обработки JSON данных

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/search/:keyword", (request, response) => {
    const keyword = request.params.keyword;
    const linksArray = linksObject[keyword];
    
    if (!linksArray) {
        return response.status(404).json({ error: "Ключевое слово не найдено" });
    }

    response.setHeader('Connection', 'keep-alive');
    response.status(200).json(linksArray);
});

app.get('/proxy', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Ошибка загрузки ресурса');
    }
});

app.listen(3000, () => {
    console.log("Сервер запущен на http://localhost:3000");
});