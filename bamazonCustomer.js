// Check for the connected js file
console.log('BamazonCustomer.js Connected!');

// Require npm module mysql
const mysql = require('mysql');

// Require the inquirer npm package
const inquirer = require('inquirer');

// Set the global variables
let prodID = 0;
let prodQuant = 0;

// Create a connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Laxman27',
  database: 'bamazon',
});

// Make connection
connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);

  // Call the Read Products function
  readProducts();
});

// Function to get all the products
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
}// End readProducts

// Function to start the questions
function inqBuy() {
  inquirer
  // First prompt if want to exit or continue
    .prompt([
      {
        type: 'confirm',
        name: 'exit',
        message: 'Exit',
      },
    ])
    .then((answers) => {
      // If choose exit, show message and end connection
      if (answers.exit === true) {
        console.log('Thank you for shopping, come again!');
        connection.end();
        return false;
      }
      // If want to continue, prompt for what to buy
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
          // Call makePurchase function, pass the answers object
          makePurchase(answers);
        });
    });
}// End inqBuy

// Function to make the purchase
function makePurchase(answers) {
  // First check if there is sufficient quantity
  console.log('Checking Product Stock Level...\n');
  prodID = answers.id;
  prodQuant = answers.units;
  // console.log(prodID);

  // Make the query based on the prodID
  const sql = `SELECT stock_quantity FROM products Where item_id = ${connection.escape(prodID)}`;
  connection.query(sql, (err, res) => {
    if (err) throw err;

    // console.log(res[0].stock_quantity);

    // Get the stock quantity
    const result = res[0].stock_quantity;

    // Make sure there is enough stock
    if (result > prodQuant) {
      // Update quantity
      const updatedQuant = result - prodQuant;

      // Calculate Cost and complete the purchase
      cost(prodID, prodQuant, updatedQuant);
      // console.log(`Cost Result: ${costResult}`);
    } else {
      console.log(
        'Stock Quantity Insufficient, unable to complete the purchase.\nTry again tomorrow, thank you.',
      );

      // Restart
      readProducts();
    }
  });
}// End makePurchase

// Get the price and calculate cost
function cost(prodID, prodQuant, updatedQuant) {
  // console.log(`Product Id: ${prodID}, Product Quant: ${prodQuant}`);

  const sql = `SELECT price FROM products Where item_id = ${connection.escape(prodID)}`;
  connection.query(sql, (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    // console.log(res);

    // console.log(res[0].price);
    const { price } = res[0];

    const calcCost = price * prodQuant;
    // console.log(`Cost!!: ${calcCost}`);

    // Make the purchase
    console.log(`Completing the Purchase...\nYour total cost is ${calcCost}`);

    // Update the db
    const query = connection.query(
      'UPDATE products SET ? WHERE ?',
      [
        {
          stock_quantity: updatedQuant,
        },
        {
          item_id: prodID,
        },
      ],
      (err, res) => {
        if (err) throw err;
        console.log(`${res.affectedRows} products updated!\n`);
        // Show updated quant
        readProducts();
      },
    );
  });
}// End cost
