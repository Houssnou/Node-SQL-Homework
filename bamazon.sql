DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products
(  item_id INTEGER NOT NULL  AUTO_INCREMENT,
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