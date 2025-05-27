const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');

const app = express();
const PORT = 3002;
const bookFile = './proj.csv';

app.use(express.json());

function readBooks() {
    return new Promise((resolve, reject) => {
        const books = [];
        fs.createReadStream(bookFile)
            .pipe(csvParser())
            .on('data', (row) => {
                books.push(row);
            })
            .on('end', () => resolve(books))
            .on('error', (error) => reject(error));
    });
}

app.listen(PORT, () => {
    console.log(Order service running on port ${PORT});
});