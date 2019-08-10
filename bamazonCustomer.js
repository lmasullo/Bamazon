console.log('BamazonCustomer.js Connected!');

// Require npm module mysql
const mysql = require('mysql');

// Require the inquirer npm package
const inquirer = require('inquirer');

let prodID = 0;
let prodQuant = 0;

// Create a connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'bamazon',
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);
  // Call the Read Products
  readProducts();
});

function readProducts() {
  console.log('Selecting all products...\n');
  connection.query('SELECT * FROM products', (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    // connection.end();

    // Call the Initial Buy Inquirer
    inqBuy();
  });
}

function makePurchase(answers) {
  // First check if there is sufficient quantity
  console.log('Checking Product Stock Level...\n');
  prodID = answers.id;
  prodQuant = answers.units;
  console.log(prodID);

  const sql = `SELECT stock_quantity FROM products Where item_id = ${connection.escape(prodID)}`;
  connection.query(sql, (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res[0].stock_quantity);
    const result = res[0].stock_quantity;
    if (result > prodQuant) {
      // Update quantity
      const updatedQuant = result - prodQuant;

      // Calculate Cost
      const costResult = cost(prodID, prodQuant);
      console.log(`Cost Result: ${costResult}`);

      // Make the purchase
      console.log(`Completing the Purchase...\nYour total cost is ${costResult}`);

      const query = connection.query(
        'UPDATE products SET ? WHERE ?',
        [
          {
            stock_quantity: updatedQuant,
          },
          {
            item_id: answers.id,
          },
        ],
        (err, res) => {
          if (err) throw err;
          console.log(`${res.affectedRows} products updated!\n`);
          // todo Show updated quant
        },
      );
    } else {
      console.log(
        'Stock Quantity Insufficient, unable to complete the purchase.\nTry again tomorrow, thank you.',
      );
    }
  });
}

function inqBuy() {
  inquirer
    .prompt([
      {
        type: 'input',
        message: 'Type the ID of the product you would like to buy?',
        name: 'id',
      },
      {
        type: 'input',
        message: 'How many units of the product would you like to buy?',
        name: 'units',
      },
    ])
    .then((answers) => {
      console.log(answers);
      // Call makePurchase function, pass the answers object
      makePurchase(answers);
    });
}

// Get the price
function cost(prodID, prodQuant) {
  const sql = `SELECT price FROM products Where item_id = ${connection.escape(prodID)}`;
  connection.query(sql, (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res);

    // console.log(res[0].price);
    const price = res[0].price;

    const calcCost = price * prodQuant;
    // console.log(calcCost);

    return calcCost;

    // connection.end();
  });
}

//! Need to quit connection!!!!!
