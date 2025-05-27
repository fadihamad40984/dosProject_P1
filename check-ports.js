const http = require('http');

const ports = [
    { service: 'Front-end', port: 3000 },
    { service: 'Catalog Server', port: 3001 },
    { service: 'Order Server', port: 3002 },
    { service: 'Catalog Server', port: 3003 },
    { service: 'Order Server', port: 3004 }
];

console.log('Checking all service ports...\n');

ports.forEach(({ service, port }) => {
    const options = {
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`${service} (Port ${port}): ✅ Running`);
    });

    req.on('error', (error) => {
        console.log(`${service} (Port ${port}): ❌ Not responding`);
    });

    req.end();
}); 