DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products
( item_id INTEGER NOT NULL  AUTO_INCREMENT,
  product_name VARCHAR  (45) NOT NULL,
  department_name VARCHAR  (45) ,
  price INTEGER NOT NULL,
  stock_quantity INTEGER NOT NULL,

  PRIMARY KEY  (item_id)
);

  INSERT INTO 
products
    (product_name, department_name, price, stock_quantity)
  VALUES
    ("Slim Pants", "Men's Fashion", 49.99, 100),
    ("Boots", "Men's Fashion", 120.99, 120),
    ("V-Neck", "Men's Fashion", 19.99, 75),
    ("Blazer", "Men's Fashion", 149.99, 100),
    ("Casio Watch", "Men's Fashion", 120.99, 120),
    ("Pants", "Women's Fashion", 49.99, 100),
    ("Boots", "Women's Fashion", 120.99, 120),
    ("Knitwear", "Women's Fashion", 19.99, 75),
    ("Women Coat", "Women's Fashion", 149.99, 100),
    ("MK Watch", "Women's Fashion", 120.99, 120);

CREATE TABLE departments
( department_id INTEGER NOT NULL  AUTO_INCREMENT,
  department_name VARCHAR  (45) NOT NULL,
  over_head_costs INTEGER NOT NULL DEFAULT 0,
  
  PRIMARY KEY  (department_id)
);

INSERT INTO 
departments
    (department_name, over_head_costs)
  VALUES
    ("Men's Fashion", 10000),
    ("Women's Fashion", 12000),
    ("Baby Apparel", 8000),
    ("Electronics", 5000),
    ("House Supply", 12000),
    ("Kids Apparel", 2500),
    ("Animal Care", 1000);

ALTER TABLE products
ADD products_sale float ;

Update products
set products_sale = 0;

