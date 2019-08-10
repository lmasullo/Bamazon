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
  password: 'Laxman27',
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
    //connection.end();

    // Call the Initial Buy Inquirer
    inqBuy();
  });
}

function makePurchase(answers){
  //First check if there is sufficient quantity
  console.log('Checking Product Stock Level...\n');
  let prodID = answers.id;
  console.log(prodID);
  
  let sql = 'SELECT stock_quantity FROM products Where item_id = ' + connection.escape(prodID);
  connection.query(sql, (err, res) => {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.log(res[0].stock_quantity);
    let result = res[0].stock_quantity;
    if (result > answers.units){
      //Update quantity
      let updatedQuant = result - answers.units;
      //Make the purchase
      console.log('Completing the Purchase...\n');

      
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
            //todo Show updated quant
          },
        );
        

    }else{
      console.log('Stock Quantity Insufficient, unable to complete the purchase.\nTry again tomorrow, thank you.');
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
      //Call makePurchase function, pass the answers object
      makePurchase(answers);
    });
}


//!Need to quit connection!!!!!
