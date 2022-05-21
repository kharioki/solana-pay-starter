import products from './products.json';

export default function handler(req, res) {
  // if a GET request
  if (req.method === 'GET') {
    // remove hashes from products.json
    const cleanProducts = products.map(product => {
      delete product.hash;
      return product;
    });

    res.status(200).json(cleanProducts);
  }
  else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
}
