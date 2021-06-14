const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: 'root',
  
    // Your password
    password: 'Joyce_Stacy_20&',
    database: 'employees',
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log('connected');
    connection.end();
  });







  