const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Joyce_Stacy_20&',
    database: 'employees',
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    promptUser();
  });

  const promptUser = async () => {
      inquirer.prompt([
        {
            type:'list',
            name: 'action',
            message: 'What would you like to do',
            choices: ['View all Employees', 'View Employees by Department', 'View employees by Manager','View Departments','View Roles','Add Department','Add Role','Add Employee', 'Delete Department','Delete Role','Delete Employee','Update Employee Role','Update Employee Manager','View Total Utilized Budget of a Department','Exit']
        }

      ]) 
      .then((answer) => {
            let roles = [];
            let managers = [];
            let departments = [];
            let employees = [];
            switch(answer.action) {
                case 'View all Employees':
                    const query = `SELECT * FROM employee`
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    displayTable(table.getTable(res));
                    promptUser();
                    });
                break;
                
                case 'View Employees by Department':
                    const query = `SELECT name FROM department ORDER BY name`;
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    viewEmpDep(res);
                    });
                break;

                case 'View employees by Manager':
                    const query =`SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee WHERE manager_id IS NULL ORDER BY last_name`;
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    viewEmpMan(res);
                    });
                break;
                
                case 'View Departments':
                    const query = `SELECT * FROM department`;
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    displayTable(table.getTable(res));
                    promptUser();
                    });
                    break;

                case 'View Roles':
                    const query = `SELECT id,title,CONCAT("$",FORMAT(salary,2)) AS Salary,department_id FROM role`;
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    displayTable(table.getTable(res));
                    promptUser();
                    });
                break;

                case 'Add Department':
                    addDep();
                break;

                case 'add Role':
                    const query =`SELECT name FROM department`;
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    res.forEach(({ name }) => departments.push(name));
                    addRole(departments);
                    });
                break;

                case 'add Employee':
                    const query = `SELECT title FROM role ORDER BY title`;
                    const query1 = `SELECT CONCAT(first_name, " " , last_name) as manager FROM employee WHERE manager_id IS NULL 
                    ORDER BY last_name`;
                    connection.query(query, (err,res) => {
                    if(err) throw err;
                    res.forEach(({ title }) => roles.push(title));
                    });
                    connection.query(query1, (err,res) => {
                    if(err) throw err;
                    res.forEach(({ manager }) => managers.push(manager));
                    });
                    addEmp(roles, managers);
                break;
                
                case 'Delete Department':
                    delDep();
                    break;
                case 'Delete Role':
                    delRole();
                    break;
                case 'Delete Employee':
                    DelEmp();
                    break;
                case 'Update Employee Role':
                    UpdEmpRole();
                    break;
                case 'Update Employee Manager':
                    UpdEmpMan();
                    break;
                case 'View Total Utilized Budget of a Department':
                    ViewBudDep();
                    break;
                case 'Exit':
                    Exit();
                    break;

            }

      });
  }









  