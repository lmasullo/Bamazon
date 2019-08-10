console.log('BamazonCustomer.js Connected!');

// Require npm module mysql
const mysql = require('mysql');

// Require the inquirer npm package
const inquirer = require('inquirer');

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
    connection.end();

    // Call the Initial Buy Inquirer
    inqBuy();
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
    ])
    .then((answers) => {});
}
