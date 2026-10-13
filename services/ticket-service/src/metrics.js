const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const ticketPurchasesTotal = new client.Counter({
  name: 'ticket_purchases_total',
  help: 'Total count of ticket purchase outcomes',
  labelNames: ['status'],
  registers: [register]
});

module.exports = {
  register,
  httpRequestsTotal,
  ticketPurchasesTotal
};
