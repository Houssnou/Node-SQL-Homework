//inquirer and mysql
const inquirer = require("inquirer");
const mysql = require("mysql");
require('console.table');

const cnx = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "@Watinoma00",
  database: "bamazon_db"
});

cnx.connect((err) => {
  if (err) throw err;
  console.log("=> Connected to bamazon_bd");
  //run function displayAllProducts
  displayProducts();
});



const displayProducts = () => {

  const query = cnx.query("SELECT * FROM products", (err, products) => {
    if (err) throw err;

    //** the customer doesnt need to see the sales column from this table 
    //so we will build an array of object that containts a copy of the table without the sales part
    const data = [];
    for (var key in products) {
      data.push({
        "ID": products[key].item_id,
        "NAME": products[key].product_name,
        "DEPARTMENT": products[key].department_name,
        "PRICE": `$${products[key].price}`,
        "QUANTITY": products[key].stock_quantity,
      });
    }
    //new console table to display the content as a table
    console.table(data);

   //run function buyProduct with the displayed table
    buyProduct(products);    
  });
  console.log(query.sql);
}
// function to process the buy 
const buyProduct = (table) => {
    //prompt the user to get his values //now we working with the data returned by the query 
    inquirer.prompt([{
      name: "user_product",
      message: "Select a product",
      type: "list",
      choices: table.map(product => product.product_name)
    }, {
      name: "user_qty",
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
    }]).then(userPick => {
      //first level logic to process the purchase or not 

      //find what the product the user picked to gather more info
      const userProduct = table.find(product => product.product_name === userPick.user_product);

      if (userPick.user_qty < userProduct.stock_quantity) {
        //generate the total for confirmation purposes
        const total = userProduct.price * userPick.user_qty;

        //update product sales
        const sales = total + userProduct.product_sales;
  
        //confirmation message
        inquirer.prompt({
          type: "confirm",
          name: "confirmBuy",
          message: `Would you like to buy this product: ${userProduct.product_name},${userPick.user_qty} time(s) for a total of $${total}? `,
          default: true
        }).then((confirmation) => {
          //second level just as a proof of concept 
          //get a confirmation for the purchase
          if (confirmation.confirmBuy) {
            //purchase authorized
            //Update database with the new qty 
            const currentQty = userProduct.stock_quantity - userPick.user_qty;
  
            //update query to update db
            const updateString = "Update products set ? where ?";
            const updateData={
              stock_quantity:currentQty,
              product_sales:sales              
            };
            const updateWhere={
              item_id:userProduct.item_id
            };
            //cnx to the dabase to update the product
            const updateQuery=cnx.query(updateString, [updateData,updateWhere], (err, result) => {
              if (err) throw err;
  
              console.log(`\n Purchase completed`);
              console.log(`Item: ${userProduct.product_name}, Qty:${userPick.user_qty} purchased! `);  
              
              //start another transaction
              displayProducts();
            });
            console.log(updateQuery.sql);
          } else {
            //user cancel purchase.
            console.log("\nOperation cancelled! Please select another product from our inventory!");
            return displayProducts();  
          }
          //end second level
        });
      }else {
        //Not enought in stock.
        console.log("\nSorry! Not enought in stock at this time");
        console.log("Try another time or another product ");
        return displayProducts();        
      }
    //end firs level    
  });
  //end function buyProduct
}