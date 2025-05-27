const express = require('express');
const axios = require('axios');
const app = express();
const cache = new Map();
app.use(express.json());

const catalogServers = ['http://localhost:3001', 'http://localhost:3003'];
const orderServers = ['http://localhost:3002', 'http://localhost:3004'];

async function isServerAvailable(server) {
    try {
        await axios.get(`${server}/status`);
        return true;
    } catch {
        return false;
    }
}

async function getNextServer(servers) {
    for (let index = 0; index < servers.length; index++) {
        const server = servers[index];
        if (await isServerAvailable(server)) {
            return server;
        }
    }
}

app.get('/search/:topic', async (req, res) => {
    const topic = req.params.topic;
    if (cache.has(topic)) {
        const cached = cache.get(topic);
        if (cached.expiry > Date.now()) {
            return res.json({ source: 'cache', data: cached.data });
        }
    }
    const server = await getNextServer(catalogServers);
    const response = await axios.get(`${server}/search/${topic}`);
    cache.set(topic, { data: response.data, expiry: Date.now() + 30000 });
    res.json(response.data);
});

app.get('/info/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    if (cache.has(itemNumber)) {
        const cached = cache.get(itemNumber);
        if (cached.expiry > Date.now()) {
            return res.json({ source: 'cache', data: cached.data });
        }
    }
    const server = await getNextServer(catalogServers);
    const response = await axios.get(`${server}/info/${itemNumber}`);
    cache.set(itemNumber, { data: response.data, expiry: Date.now() + 30000 });
    res.json(response.data);
});

app.post('/purchase/:item_number', async (req, res) => {
    const itemNumber = req.params.item_number;
    const { title, quantity } = req.body;
    try {
        const response = await axios.post(`${await getNextServer(orderServers)}/purchase/${itemNumber}`, { title, quantity });
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error processing purchase');
    }
});

app.listen(8080, () => console.log('Frontend server running on port 8080'));
