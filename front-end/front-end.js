const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());


app.get('/search', async (req, res) => {
    const topic = req.query.topic;
    try {
        const response = await axios.get(`http://localhost:3001/search/${topic}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching books by topic');
    }
}); 




app.get('/info/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    try {
        const response = await axios.get(`http://localhost:3001/info/${itemNumber}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching book information');
    }
});

app.post('/purchase/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    const { title, quantity } = req.body; 

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    try {
        const response = await axios.post(`http://order-server:3002/purchase/${itemNumber}`, { title, quantity });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error processing purchase');
    }
});

app.listen(3000, () => {
    console.log(`Front-end service successfully started on port 3000`);
});
