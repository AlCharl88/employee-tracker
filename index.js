const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('console.table');

let sql = "";
let sql2 = "";

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
                    sql = `SELECT * FROM employee`
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                break;
                
                case 'View Employees by Department':
                    sql = `SELECT name FROM department ORDER BY name`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    viewEmpDep(res);
                    });
                break;

                case 'View employees by Manager':
                    sql =`SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee WHERE manager_id IS NULL ORDER BY last_name`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    viewEmpMan(res);
                    });
                break;
                
                case 'View Departments':
                    sql = `SELECT * FROM department`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                    break;

                case 'View Roles':
                    sql = `SELECT id,title,CONCAT("$",FORMAT(salary,2)) AS Salary,department_id FROM role`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                break;

                case 'Add Department':
                    addDep();
                break;

                case 'add Role':
                    sql =`SELECT name FROM department`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    res.forEach(({ name }) => departments.push(name));
                    addRole(departments);
                    });
                break;

                case 'add Employee':
                    sql = `SELECT title FROM role ORDER BY title`;
                    sql2 = `SELECT CONCAT(first_name, " " , last_name) as manager FROM employee WHERE manager_id IS NULL 
                    ORDER BY last_name`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    res.forEach(({ title }) => roles.push(title));
                    });
                    connection.query(sql2, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({ manager }) => managers.push(manager));
                    addEmp(roles, managers);
                    });
                break;
                
                case 'Delete Employee':
                    sql = `SELECT CONCAT(first_name, " " , last_name) as employee FROM employee ORDER BY last_name`;
                    connection.query(sql, (err,res) => {
                    if(err) throw err;
                    res.forEach(({ employee }) => employees.push(employee));
                    DelEmp();
                    });
                break;
                
                case 'Update Employee Role':
                    sql = `SELECT CONCAT(first_name, " " , last_name) as employee FROM employee ORDER BY last_name`;
                    sql2 = `SELECT title FROM role ORDER BY title`;
                    connection.query(sql, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({ employee }) => employees.push(employee));
                    });
                    connection.query(sql2, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({ title }) => roles.push(title));
                    UpdEmpRole(employees, roles);
                    });
                    
                break;

                case 'Update Employee Manager':
                    sql = `SELECT CONCAT(first_name, " " , last_name) as employee FROM employee WHERE manager_id IS NOT NULL ORDER BY last_name`;
                    sql2 = `SELECT CONCAT(first_name, " " , last_name) as manager FROM employee WHERE manager_id IS NULL 
                    ORDER BY last_name`;
                    connection.query(sql, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({ employee }) => employees.push(employee));
                    });
                    connection.query(sql2, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({ manager }) => managers.push(manager));
                    UpdEmpMan(employees, managers);
                    });
                break;

                case 'View Total Utilized Budget of a Department':
                    sql = `SELECT d.name,CONCAT("$",FORMAT(SUM(r.salary),2)) AS TotalBudget FROM department d JOIN role r
                    ON d.id = r.department_id JOIN employee e ON r.id = e.role_id GROUP BY d.name ORDER BY d.name`;
                    connection.query(sql,(err, res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                    
                break;

                case 'Exit':
                    connection.end();

            };

      })
  };

  const UpdEmpMan = async (employees, managers) => {
    let managerID = "";
    inquirer.prompt([
      {
        name: 'employee',
        type: 'list',
        message: 'Select the employee you want to change',
        choices: employees
      },
      {
        name: 'manager',
        type: 'list',
        message: 'Select the manager you wante to assign to this employee!',
        choices: managers
      }
    ]).then((data) => {
      
      sql2 =`SELECT id from employee WHERE CONCAT(first_name, " " , last_name) = "${data.manager}"`;
    
      connection.query(sql2, async (err, res)  => {
        if(err) throw err;
        managerID = res[0].id;

         sql = `UPDATE employee SET manager_id = ${managerID} WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`;
         connection.query(sql, async (err,res)=> {
         if(err) throw err;
         console.log(`${res.affectedRows} row updated!`);
         console.log(`Updated "${data.employee}", changed their manager to "${data.manager}"!`);
          promptUser();
        });
      });
    });
  };

  const UpdEmpRole = async(employees,roles) => {
    inquirer.prompt([
      {
        name: 'employee',
        type: 'list',
        message: 'Select the employee for which you want the role to change',
        choices: employees
      },
      {
        name: 'role',
        type: 'list',
        message: 'Select the role you want to assign to this employee',
        choices: roles
      }
    ]).then((data)=> {
      sql = `UPDATE employee SET role_id = (SELECT id FROM role WHERE title = "${data.role}") WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`
        connection.query(sql, (err,res)=> {
          if(err) throw err;
          console.log(`${res.affectedRows} row updated!`);
          console.log(`Updated "${data.employee}", changed their role to "${data.role}"!`);
          promptUser();
        });
    });
  };


  const DelEmp = async (employees) => {
    inquirer.prompt([
      {
        name: 'employee',
        type: 'list',
        message: 'Select the employee you want to delete',
        choices: employees
      }
    ]).then((data)=> {
      sql = `DELETE FROM employee WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`
        connection.query(sql, (err,res)=> {
          if(err) throw err;
          console.log(`${res.affectedRows} employee deleted from the database`);
          console.log(`Deleted "${data.employee}"!`);
          promptUser();
        });
    });
  };


  const addDep = async () => {
    inquirer.prompt([
     {
        name: 'dept',
        type: 'input',
        message: 'Enter the name of the new depatment?'
      }
    ]).then((data) =>{
      sql = `INSERT INTO department(name) VALUES ("${data.dept}")`
      connection.query(sql, (err,res) => {
        if(err) throw err;
        console.log(`${res.affectedRows} department added!\n`)
        console.log(`Added ${data.dept} to the database!`);
        promptUser();
      });
    });
  };

  const addRole = async (departments) => {
    inquirer.prompt([
      {
        name: 'role',
        type: 'input',
        message: 'What is the Role you want to create?'
      },
      {
        name: 'salary',
        type: 'input',
        message: 'What is the salary for this role?'
      },
      {
        name: 'dept',
        type: 'list',
        message: 'Which department will benefit the role?',
        choices: departments
      }
    ]).then((data) =>{
      sql = `INSERT INTO role(title,salary,department_id) VALUES ("${data.role}",${data.salary},
      (SELECT id FROM department WHERE name = "${data.dept}"))`
      connection.query(query, (err,res) => {
        if(err) throw err;
        console.log(`${res.affectedRows} role added!\n`)
        console.log(`Added ${data.role} for the ${data.dept} department to the database!`);
        promptUser();
      });
    });
  };

  const addEmp = async (roles, managers) => {
    let managerID = "";
    let roleID = "";
    
    let managerQuery = `SELECT id FROM employee WHERE CONCAT(first_name, " " , last_name) = ?`;
  
    inquirer.prompt([
      {
        name: 'firstname',
        type: 'input',
        message: 'Enter the Employee\'s First Name!'
      },
      {
        name: 'lastname',
        type: 'input',
        message: 'Enter the Employee\'s Last Name!'
      },
      {
        name: 'roles',
        type: 'list',
        message: 'What is the role for this employee?',
        choices: roles,
      },
      {
        name: 'manager',
        type: 'list',
        message: 'Who is this employee\'s manager?',
        choices: managers,
      },
    ]).then((empdata) => {
      let roleQuery = `SELECT id FROM role WHERE title = "${empdata.roles}"`;
      connection.query(roleQuery, (err,res) => {
        if(err) throw err;
        roleID = res[0].id;
      });
      connection.query(managerQuery,[empdata.manager], (err,res) => {
        if(err) throw err;
        managerID = res[0].id;
  
        let query = `INSERT INTO employee(first_name,last_name,role_id,manager_id)
          VALUES ("${empdata.firstname}","${empdata.lastname}",${roleID},${managerID})`;
          connection.query(query, (err,res) => {
            if(err) throw err;
            console.log(`${res.affectedRows} employee added!\n`)
            console.log(`Added ${empdata.firstname} ${empdata.lastname} to the database!`);
            promptUser();
        });
  
      });
      
    });
  };
  
  const viewEmpDep = async (departments) => {
    inquirer.prompt({
      type: 'list',
      name: 'dept',
      message: 'Which department do you want to view?',
      choices: departments,
    }).then((answer) => {
      let query = `SELECT e.id, e.first_name, e.last_name, r.title,
      d.name as department, r.salary, CONCAT(e2.first_name, " " ,e2.last_name) as manager
      FROM department d JOIN role r ON d.id = r.department_id 
      JOIN employee e ON r.id = e.role_id
      LEFT JOIN employee e2 ON e.manager_id = e2.id
      where d.name = ?
      ORDER BY d.name, e.last_name`;
      connection.query(query,[answer.dept],(err, res) => {
        if(err) throw err;
        displayTable(res);
      });
    });
  };
  
  const viewEmpMan = async (managers) => {
    inquirer.prompt({
      type: 'list',
      name: 'mgr',
      message: 'Which managers department would you like to view?',
      choices: managers,
    }).then((answer) => {
      query = `SELECT * FROM employee WHERE manager_id = 
      (SELECT id FROM employee WHERE CONCAT(first_name, " " ,last_name) ="${answer.mgr}")`
        connection.query(query,(err, res) => {
          if(err) throw err;
          displayTable(res);
        });
      });
  };
  
  const displayTable = (data) => {
    console.log(table.getTable(data));
    promptUser();
  };


  



  