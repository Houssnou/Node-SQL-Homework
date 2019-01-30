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

//function display menu
const menu = () => {
  inquirer
    .prompt([{
      type: "list",
      name: "menu",
      message: "....:MENU:....",
      choices: ["View Sales by Department", "Create New Department","Exit"]
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

        default:
        return process.exit(0);
      }
    });
}

//function display products sales by department
const displaySales = () => {
  //query to retrive the data. its a crazy one so for a better understanding copy paste in MySQl Workbench.
  const sqlstring = "SELECT D.department_id As department_id , D.department_name As department_name ,  D.over_head_costs AS over_head_costs,  SUM(P.product_sales) as Total_sales ,  SUM(P.product_sales) - D.over_head_costs As total_profit   FROM departments as D  INNER JOIN products as P ON D.department_name = P.department_name  Group by D.department_id ";

  //accessing the DB to retrieve the data
  const query = cnx.query(sqlstring, (err, res) => {
    if (err) throw err;
    //new console table to display the content as a table
    console.table(res);

    //display menu back 
     menu();
  });
  //console.log(query.sql);
}

const getNewDepartment = () => {
  return inquirer.prompt([{
      name: "department_name",
      message: "New Department Name: "
    },
    {
      name: "costs",
      message: "Enter the total department over head cost: ",
      validate: function (depCost) {
        if (!isNaN(depCost) && (depCost > 1)) {
          return true;
        } else {
          console.log("\n Enter an integer!")
          return false;
        }
      },
      filter: function (depCost) {
        return parseInt(depCost);
      }
    }
  ]);
}
const createNewDepartment = async () => {
  //get the values from the inquirer function getNewDepartment
  const newDepartment = await getNewDepartment();

  //building the new department object
  const departmentData = {
    department_name: newDepartment.department_name,
    over_head_costs: newDepartment.costs
  };

  //query to insert values 
  const sqlstring = "INSERT INTO departments SET ?";
  //establish cnx to insert values
  const query = cnx.query(sqlstring, departmentData, (err, data) => {
    if (err) throw err;

    console.log(`New Department Created!!!`);
    console.log(`${data.affectedRows} - row inserted`);

    //display menu again
    menu();
  });
  console.log(query.sql);
}