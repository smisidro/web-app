const express = require('express')
const app = express();

const port = 3000;

app.get('/', (req, res) => {
    res.send('Sofia Marie Isidro');
});

app.get('/show', (req, res) => {
    res.send('show data here');
});

app.listen(port, () => {
    console.log(`Server is running on https://localhost:${port}`);
});