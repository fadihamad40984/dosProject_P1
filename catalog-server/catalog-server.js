const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 3001;

let catalog = [];

fs.createReadStream('./proj.csv')
    .pipe(csv())
    .on('data', (data) => {
        data.id = parseInt(data.id);
        data.price = parseFloat(data.price);
        data.stock = parseInt(data.stock);
        catalog.push(data);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });

app.use(express.json());

app.get('/search/:topic', (req, res) => {
  const topic = req.params.topic;
  const result = catalog.filter(book => book.topic.toLowerCase() === topic.toLowerCase());
  result.length > 0 ? res.json(result) : res.status(404).send('No books found for this topic');
});

app.get('/info/:item_number', (req, res) => {
  const itemNumber = parseInt(req.params.item_number);
  const book = catalog.find(book => book.id === itemNumber);
  book ? res.json(book) : res.status(404).send('Book not found');
});


app.put('/update', (req, res) => {
    const { id, stock, price } = req.body;
    
    const book = catalog.find(book => book.id === id);

    if (book) {
        if (stock !== undefined) book.stock = stock;
        if (price !== undefined) book.price = price;

        const csvWriter = createCsvWriter({
            path: './proj.csv',
            header: [
                { id: 'id', title: 'id' },
                { id: 'title', title: 'title' },
                { id: 'author', title: 'author' },
                { id: 'topic', title: 'topic' },
                { id: 'price', title: 'price' },
                { id: 'stock', title: 'stock' }
            ]
        });

        csvWriter.writeRecords(catalog) 
            .then(() => {
                console.log('CSV file updated successfully');
                res.json(book);  
            })
            .catch((error) => {
                console.error('Error writing CSV file:', error);
                res.status(500).send('Error updating CSV file');
            });
    } else {
        res.status(404).send('Book not found');
    }
});

app.listen(PORT, () => {
    console.log(`Catalog service running on port ${PORT}`);
});
