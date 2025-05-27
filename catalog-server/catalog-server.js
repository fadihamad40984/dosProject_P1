const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify/sync');

const app = express();
const PORT = 3001;
const csvFilePath = './proj.csv';
app.use(express.json());

function readCatalog() {
    return new Promise((resolve, reject) => {
        const catalog = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => {
                data.id = parseInt(data.id);
                data.price = parseFloat(data.price);
                data.stock = parseInt(data.stock);
                catalog.push(data);
            })
            .on('end', () => resolve(catalog))
            .on('error', reject);
    });
}

function saveCatalog(catalog) {
    const csvData = stringify(catalog, { header: true });
    fs.writeFileSync(csvFilePath, csvData, 'utf8');
}

app.get('/search/:topic', async (req, res) => {
    try {
        const topic = req.params.topic.toLowerCase();
        const catalog = await readCatalog();
        const result = catalog.filter(book => book.topic.toLowerCase() === topic);
        result.length > 0 ? res.json(result) : res.status(404).send('No books found');
    } catch (err) {
        res.status(500).send('Error reading catalog');
    }
});

app.get('/info/:item_number', async (req, res) => {
    try {
        const id = parseInt(req.params.item_number);
        const catalog = await readCatalog();
        const book = catalog.find(b => b.id === id);
        book ? res.json(book) : res.status(404).send('Book not found');
    } catch {
        res.status(500).send('Error reading catalog');
    }
});

app.put('/update', async (req, res) => {
    try {
        const { id, stock, price } = req.body;
        const catalog = await readCatalog();
        const book = catalog.find(b => b.id === id);

        if (book) {
            if (stock !== undefined) book.stock = stock;
            if (price !== undefined) book.price = price;

            saveCatalog(catalog);
            res.json(book);
        } else {
            res.status(404).send('Book not found');
        }
    } catch {
        res.status(500).send('Error updating catalog');
    }
});

app.listen(PORT, () => {
    console.log(`Catalog server running on port ${PORT}`);
});
