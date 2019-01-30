//inquirer and mysql
const inquirer = require("inquirer");
const mysql = require("mysql");
require('console.table');

const cnx = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon_db"
});

cnx.connect((err) => {
  if (err) throw err;
  console.log("=> Connected to bamazon_bd");
  //run function menu
  menu();
});

//display product
const displayProducts = () => {
  const sqlString = "SELECT * FROM products";
  const query = cnx.query(sqlString, (err, res) => {
    if (err) throw err;
    //new console table to display the content as a table
    console.table(res);
    //display menu back 
    menu();
  });
  console.log(query.sql);
}

//function Low inventory
const lowInventory = () => {
  const lowStockSql = "SELECT * FROM products where stock_quantity < 100";
  const query = cnx.query(lowStockSql, (err, res) => {
    if (err) throw err;
    //new console table to display the content as a table
    console.table(res);
    //display menu back 
    menu();
  });
  console.log(query.sql);
}

//function getProduct using inquirer to get the values and validate values.
const getNewProduct = () => {
  return inquirer.prompt([{
    name: "name",
    message: "Product Name: "
  }, {
    name: "department",
    message: "Department Name: "
  }, {
    name: "price",
    message: "Price: ",
    validate: function (priceInput) {
      if (priceInput >= 1) {
        return true;
      } else {
        console.log("\n Enter a valid price(00.00)");
        return false;
      }
    },
    filter: function (priceInput) {
      return parseFloat(priceInput);
    }

  }, {
    name: "quantity",
    message: "Quantity in store: ",
    validate: function (qtyInput) {
      if (!isNaN(qtyInput) && qtyInput >= 1) {
        return true;
      } else {
        console.log("\n Enter a valid number for the quantity");
        return false;
      }
    },
    filter: function (qtyInput) {
      return parseFloat(qtyInput);
    }
  }]);
}

//add a new product
const AddNewProduct = async () => {
  // get the new product values from inquirer function
  const newProduct = await getNewProduct();

  //bulding the new product object
  const insertSql = "INSERT INTO products SET ?";

  const insertData = {
    product_name: newProduct.name,
    department_name: newProduct.department,
    price: newProduct.price,
    stock_quantity: newProduct.quantity,
    product_sales: 0
  };

  //cnx to the bd to insert the productinsertData
  const query = cnx.query(insertSql, insertData, (err, res) => {
    if (err) throw err;
    //console.log result
    console.log(`Product inserted!`);
    console.log(`${res.affectedRows} - row inserted `);

    //display menu again
    menu();
  });
  console.log(query.sql);
}

//function addInventory
const addInventory = async () => {
  console.clear();
  const lowStockSql = "SELECT * FROM products where stock_quantity < 100";
  const query = cnx.query(lowStockSql, (err, products) => {
    if (err) {
      cosnsole.log(err);
    }
    //first level 
    console.table(products);
    //ask the manager which product he wants to update
    inquirer.prompt([{
      name: "product",
      message: "Select a product",
      type: "list",
      choices: products.map(product => product.product_name)
    }, {
      name: "quantity",
      message: "How many items would like to add :",
      validate: function (productQty) {
        if (!isNaN(productQty)) {
          return true;
        } else {
          console.log("\n Enter an integer!")
          return false;
        }
      },
      filter: function (productQty) {
        return parseInt(productQty);
      }
    }]).then((uProduct) => {
      //second level
      //find what the product the manager picked to gather more info
      const updatingProduct = products.find(product => product.product_name === uProduct.product);

      const inStock = updatingProduct.stock_quantity;

      //confirmation message
      return inquirer.prompt({
        type: "confirm",
        name: "confirmUpdate",
        message: `Do you want to add ${uProduct.quantity} items of this product ${updatingProduct.product_name} ? `,
        default: true
      }).then((confirmation) => {
        if (confirmation.confirmUpdate) {
          //product update validated 
          //Update database with the new qty 
          const currentQty = inStock + uProduct.quantity;

          //update query to update db
          const updateSql = "Update products set stock_quantity=? where item_id=?";

          //new cnx to the database to update the product qty
          const updateQuery = cnx.query(updateSql, [currentQty, updatingProduct.item_id], (err, result) => {
            if (err) throw err;

            console.log(`\nUpdate completed `);
            console.log(`${uProduct.quantity} - items of ${updatingProduct.product_name} added!`);
            console.log(`Current Stock: ${currentQty}`);

            //display menu
            menu();
          });
          //console.log(updateQuery.sql);
        } else {
          console.log("\n Inventory Updated cancelled!");

          //display menu
          menu();
        }
      });
      //end second level
    });
    //end first level
  });
  console.log(query.sql);
  //End function Update product
}
//function display menu
const menu = () => {
  inquirer
    .prompt([{
      type: "list",
      name: "menu",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }]).then(selection => {
      //console.log(selection.menu);
      const choice = selection.menu;
      //switch case
      switch (choice) {

        case "View Products for Sale":
          return displayProducts();

        case "View Low Inventory":
          return lowInventory();

        case "Add to Inventory":
          return addInventory();

        case "Add New Product":
          return AddNewProduct();

        case "Exit":
          return process.exit(0);

      }
    });

}