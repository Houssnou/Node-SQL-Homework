//inquirer and mysql
const inquirer = require("inquirer");
const mysql = require("mysql");

const cnx = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "@Watinoma00",
  database: "bamazon_db"
});

cnx.connect((err) => {
  if (err) throw err;
  //console.log("connected as id " + cnx.threadId);
  //run function display Menu
  displayMenu();

});

//display product
const displayProducts = () => {
  const allProductsQuery="SELECT * FROM products";
  return cnx.query(allProductsQuery, (err, res) => {
    if (err) throw err;
    //new console table to display the content as a table
    console.table(res);
    //display menu back 
    displayMenu();
  });
}

//function Low inventory
const lowInventory=()=>{
  const lowStockQuery="SELECT * FROM products where stock_quantity < 100";
  cnx.query(lowStockQuery, (err, res) => {
    if (err) throw err;
    //new console table to display the content as a table
    console.table(res);
    //display menu back 
    displayMenu();
  });
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
  }])
}

//add a new product
const AddNewProduct = async () => {
  // get the new product values from inquirer function
  const newProduct = await getNewProduct();

  //console.log(newProduct);
  const productName = newProduct.name;
  const productDepartment = newProduct.department;
  const productPrice = newProduct.price;
  const productQty = newProduct.quantity;

  //query to insert values 
  const insertQuery = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("${productName}","${productDepartment}",${productPrice},${productQty} )`;

  console.log(insertQuery);
  //const insertvalues = [productName, productDepartment, productPrice, productQty];
  //connect to the DB to insert the new product    

  cnx.query(insertQuery, (err, res) => {
    if (err) throw err;
    //console.log result
    console.log(`Product inserted!!!`);
    console.log(`${res.affectedRows} - row inserted`);
  });

  //display menu again
  displayMenu();
}

//function update product
const updateAProduct = () => {
  return inquirer.prompt([{
    name: "product_id",
    message: "ID of the product to add:",
    validate: function (productID) {
      if (!isNaN(productID)) {
        return true;
      } else {
        console.log("\n Enter an integer!")
        return false;
      }
    },
    filter: function (productID) {
      return parseInt(productID);
    }
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
  }])
}


//function addInventory
const addInventory = async () => {
  //get the id of the product that the qty will be increased
  //using function updateProduct
  const updateProduct = await updateAProduct();

  //console.log the prodcut info got from inquirer  
  console.log(`Product ID: ${updateProduct.product_id}`);
  console.log(`Quantity: ${updateProduct.quantity}`);

  //cnx to the db to get the specific product with the entered id 
  //query to get the product quantity by id
  const querySelect = "select product_name AS Name,stock_quantity As Qty,price As Price from products where item_id=?";

  cnx.query(querySelect, [updateProduct.product_id], (error, result) => {
    if (error) {
      console.log(error)
    };

    //get the values of the products from the DB
    const productName = result[0].Name;
    const inStock = result[0].Qty;
  
    //confirmation message
    return inquirer.prompt({
      type: "confirm",
      name: "confirmUpdate",
      message: `Are you sure you want to add this product: ${productName}, ${updateProduct.quantity} time(s)? `,
      default: true
    }).then((confirmation) => {
      if (confirmation.confirmUpdate) {
        //product update validated 
        //Update database with the new qty 
        const currentQty = inStock + updateProduct.quantity;

        //update query to update db
        const updateQuery = "Update products set stock_quantity=? where item_id=?";

        //new cnx to the database
        cnx.query(updateQuery, [currentQty, updateProduct.product_id], (err, result) => {
          if (err) throw err;

          console.log(`\n Update completed`);
          console.log(`\n ${updateProduct.quantity} - ${productName} added! `);
          console.log(`\n Current Stock :${currentQty}`);

          //console.log(`${result.affectedRows} record(s) updated`);
          console.log("\n\n");

          //display menu
          displayMenu();

        });
      } else {
        //clear current display 
        //and display the table of products again
        console.log("\n Inventory Updated cancelled!");

        //display menu
        displayMenu();
      }
    });
  });
}  
//function display menu
const displayMenu = () => {
  inquirer
    .prompt([{
      type: "list",
      name: "menu",
      message: "....:MENU:....",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }]).then(selection => {
      //console.log(selection.menu);
      const choice = selection.menu;
      console.log(`Menu selected: ${choice}`);

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
          return AddNewProduct();

      }
    })

}