//inquirer and mysql
const inquirer = require("inquirer");
const mysql = require("mysql");
require('console.table');

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

//function display menu
const displayMenu = () => {
  inquirer
    .prompt([{
      type: "list",
      name: "menu",
      message: "....:MENU:....",
      choices: ["View Sales by Department", "Create New Department"]
    }]).then(selection => {
      //console.log(selection.menu);
      const choice = selection.menu;
      console.log(`Menu selected: ${choice}`);

      //switch case
      switch (choice) {

        case "View Sales by Department":
          return displaySales();

        case "Create New Department":
          return createNewDepartment();

      }
    })

}
//function display products sales by department
const displaySales=()=>{
  console.log("View in progress...");
  //query to retrive the data. its a crazy one so for a better understanding copy paste in MySQl Workbench.
  const querySales="SELECT D.department_id As department_id , D.department_name As department_name , D.over_head_costs AS over_head_costs,P.product_sales As product_sales,(P.product_Sales - D.over_head_costs) As total_profit FROM departments as D INNER JOIN products as P ON D.department_name = P.department_name Group by D.department_id";

  //console.log(querySales);

  //accessing the DB to retrieve the data
  cnx.query(querySales, (err, res) => {
    if (err) throw err;
    //new console table to display the content as a table
    console.table(res);

    //display menu back 
    displayMenu();
  });

}

const getNewDepartment=()=>{
  return inquirer.prompt([{
    name: "department_name",
    message: "New Department Name: "
  },
    {
    name: "costs",
    message: "Enter the total department over head cost: ",
    validate: function (depCost) {
      if (!isNaN(depCost)&&(depCost>1)) {
        return true;
      } else {
        console.log("\n Enter an integer!")
        return false;
      }
    },
    filter: function (depCost) {
      return parseInt(depCost);
    }
  }])

}
const createNewDepartment=async()=>{
  //get the values from the inquirer function getNewDepartment
  const newDepartment= await getNewDepartment();
  console.log(newDepartment);

  
  const departmentName = newDepartment.department_name;
  const departmentCosts = newDepartment.costs;
  
  //query to insert values 
  const insertQuery = `INSERT INTO departments (department_name, over_head_costs) VALUES ("${departmentName}",${departmentCosts} )`;

  //console.log(insertQuery);
  //const insertvalues = [productName, productDepartment, productPrice, productQty];
  //connect to the DB to insert the new product    

  cnx.query(insertQuery, (err, res) => {
    if (err) throw err;

    //console.log result
    console.log(`New Department Created!!!`);
    console.log(`${res.affectedRows} - row inserted`);

    //display menu again
  displayMenu();
  });  
}
