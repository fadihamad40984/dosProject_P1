const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 3002;
const orderFile = './orders.csv';
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

function writeBooks(books) {
    const csvWriter = createCsvWriter({
        path: bookFile,
        header: [
            { id: 'id', title: 'id' },
            { id: 'title', title: 'title' },
            { id: 'author', title: 'author' },
            { id: 'topic', title: 'topic' },
            { id: 'price', title: 'price' },
            { id: 'stock', title: 'stock' },
        ],
    });
    return csvWriter.writeRecords(books);
}

function logOrder(order) {
    const csvWriter = createCsvWriter({
        path: orderFile,
        header: [
            { id: 'order_id', title: 'order_id' },
            { id: 'item_id', title: 'item_id' },
            { id: 'title', title: 'title' },
            { id: 'quantity', title: 'quantity' },
        ],
        append: true,
    });
    return csvWriter.writeRecords([order]);
}

app.listen(PORT, () => {
    console.log(Order service running on port ${PORT});
});