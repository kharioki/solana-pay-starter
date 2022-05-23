// This API endpoint will let users POST data to add records and GET to retrieve
import orders from './orders.json';
import fs from 'fs';

function get(req, res) {
  const { buyer } = req.query;

  // check if this address has any orders
  const buyerOrders = orders.filter((order) => order.buyer === buyer);
  if (buyerOrders.length === 0) {
    // 204 = success, but no content
    res.status(204).send();
  } else {
    res.status(200).json(buyerOrders);
  }
}

async function post(req, res) {
  console.log('Received add order request', req.body);

  // add new orders to orders.json
  try {
    const newOrder = req.body;

    // if this address has not purchased this item, add order to orders.json
    if (!orders.find((order) => order.buyer === newOrder.buyer.toString() && order.itemID === newOrder.itemID)) {
      orders.push(newOrder);
      await fs.writeFile('./pages/api/orders.json', JSON.stringify(orders, null, 2));
      res.status(200).json(orders)
    } else {
      res.status(400).send('You have already purchased this item');
    }
  } catch (e) {
    res.status(400).send(e);
  }
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      get(req, res);
      break;
    case 'POST':
      await post(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
  }
}
