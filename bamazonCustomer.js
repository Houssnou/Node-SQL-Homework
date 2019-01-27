//inquirer and mysql
const inquirer = require("inquirer");
const mysql = require("mysql");
//require('console.table');

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
  console.log("connected as id " + cnx.threadId);
  console.log("Enter the info for the product you would like to buy.");

  //display the products lists before getting any value to process a buying
  displayProducts();

});

const displayProducts = () => {
  return cnx.query("SELECT * FROM products", (err, res) => {
    if (err) throw err;

    /* //table data to contain the formatted data to be used the console.table
    const data=[]; 
    for(var key in res){
      data.push({
            "ID": res[key].item_id ,      
            "NAME" : res[key].product_name,      
            "DEPARTMENT": res[key].department_name ,    
            "PRICE": `$${res[key].price}` ,    
            "QUANTITY" : res[key].stock_quantity
      });
    } */
    //new console table to display the content as a table
    //console.table(res,res.slice(1));
    console.table(res);

    //run function buyProduct
    buyProduct();
  });
}

const getProduct = () => {
  return inquirer.prompt([{
    name: "product_id",
    message: "Product ID:",
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
    message: "How many items would like to purchase :",
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

// function to process the buy 
const buyProduct = async () => {

      const product = await getProduct();
      //console.log the prodcut info got from inquirer  
      console.log(`Product ID: ${product.product_id}`);
      console.log(`Quantity: ${product.quantity}`);

      //cnx to the db to get the specific product with the entered id 
      //query to get the product quantity by id
      const querySelect = "select product_name AS Name,stock_quantity As Qty,price As Price,product_sales As Sales from products where item_id=?";

      cnx.query(querySelect, [product.product_id], (error, result) => {
            if (error) {
              console.log(error)
            };

            //get the values of the products from the DB
            const productName = result[0].Name;
            const inStock = result[0].Qty;
            const price = result[0].Price;
            let sales=result[0].Sales;

            //console.log(queryData);
            if (product.quantity < inStock) {

              //generate the total for confirmation purposes
              const total = price * product.quantity;
              //update product sales
              sales+=total;

              //confirmation message
              return inquirer.prompt({
                type: "confirm",
                name: "confirmBuy",
                message: `Would you like to buy this product: ${productName},${product.quantity} time(s) for a total of $${total}? `,
                default: true
              }).then((confirmation) => {
                  if (confirmation.confirmBuy) {
                    //purchase authorized
                    //Update database with the new qty 
                    const currentQty = inStock - product.quantity;

                    //update query to update db
                    const updateQuery = "Update products set stock_quantity=?, product_sales=? where item_id=?";

                    //new cnx to the database
                    cnx.query(updateQuery,[currentQty,sales,product.product_id], (err, result)=> {
                        if (err) throw err;

                        console.log(`\n Purchase completed`); 
                        console.log(`\n Item: ${productName}, Qty:${product.quantity} purchased! `);

                        //console.log(`${result.affectedRows} record(s) updated`);
                        console.log("\n\n");
                        //display the list of product again
                        displayProducts();

                      });
                  }else {
                    //clear current display 
                    //and display the table of products again
                    console.log("\n Operation cancelled! Please select another product from our inventory!");
                   
                  displayProducts();
                  }
              });
          }
          else{
            //Not enought in stock.
            console.log("Sorry! Not enought in stock at this");
            console.log("Try another time or another product ");

            //display list of products again
            displayProducts();
          }

        });
//end function buyProduct ()
}