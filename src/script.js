const fs = require('fs');

const data = fs.readFileSync('products.json', 'utf8');
let products = JSON.parse(data);

products.forEach(product => {
  if (!product.currency) {
    product.currency = 'NGN';
  }
});

fs.writeFileSync('products.json', JSON.stringify(products, null, 2));