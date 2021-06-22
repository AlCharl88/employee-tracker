const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('console.table');


const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Joyce_Stacy_20&',
    database: 'employees_db',
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
                    connection.query(`SELECT * FROM employee`, (err,res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                break;
                
                case 'View Employees by Department':
                    connection.query(`SELECT name FROM department ORDER BY name`, (err,res) => {
                    if(err) throw err;
                    viewEmpDep(res);
                    });
                break;

                case 'View employees by Manager':
                    connection.query(`SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee WHERE manager_id IS NULL ORDER BY last_name`, (err,res) => {
                    if(err) throw err;
                    viewEmpMan(res);
                    });
                break;
                
                case 'View Departments':
                    connection.query(`SELECT * FROM department`, (err,res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                    break;

                case 'View Roles':
                    connection.query(`SELECT id,title,CONCAT("$",FORMAT(salary,2)) AS Salary,department_id FROM role`, (err,res) => {
                    if(err) throw err;
                    displayTable(res);
                    });
                break;

                case 'Add Department':
                    addDep();
                break;

                case 'Add Role':
                    connection.query(`SELECT name FROM department`, (err,res) => {
                    if(err) throw err;
                    res.forEach(({name}) => departments.push(name));
                    addRole(departments);
                    });
                break;

                case 'Add Employee':
                    connection.query(`SELECT title FROM role ORDER BY title`, (err,res) => {
                    if(err) throw err;
                    res.forEach(({title}) => roles.push(title));
                    });
                    connection.query(`SELECT CONCAT(first_name, " " , last_name) as manager FROM employee WHERE manager_id IS NULL 
                    ORDER BY last_name`, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({manager}) => managers.push(manager));
                    addEmp(roles, managers);
                    });
                break;
                
                case 'Delete Employee':
                    connection.query(`SELECT CONCAT(first_name, " " , last_name) as employee FROM employee ORDER BY last_name`, (err,res) => {
                    if(err) throw err;
                    res.forEach(({employee}) => employees.push(employee));
                    DelEmp();
                    });
                break;
                
                case 'Update Employee Role':
                    connection.query(`SELECT CONCAT(first_name, " " , last_name) as employee FROM employee ORDER BY last_name`, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({employee}) => employees.push(employee));
                    });
                    connection.query(`SELECT title FROM role ORDER BY title`, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({title}) => roles.push(title));
                    UpdEmpRole(employees, roles);
                    });
                    
                break;

                case 'Update Employee Manager':
                    connection.query(`SELECT CONCAT(first_name, " " , last_name) as employee FROM employee WHERE manager_id IS NOT NULL ORDER BY last_name`, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({employee}) => employees.push(employee));
                    });
                    connection.query(`SELECT CONCAT(first_name, " " , last_name) as manager FROM employee WHERE manager_id IS NULL 
                    ORDER BY last_name`, async (err,res) => {
                    if(err) throw err;
                    res.forEach(({manager}) => managers.push(manager));
                    UpdEmpMan(employees, managers);
                    });
                break;

                case 'View Total Utilized Budget of a Department':
                    connection.query(`SELECT d.name,CONCAT("$",FORMAT(SUM(r.salary),2)) AS TotalBudget FROM department d JOIN role r
                    ON d.id = r.department_id JOIN employee e ON r.id = e.role_id GROUP BY d.name ORDER BY d.name`,(err, res) => {
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
        choices: employees,
      },
      {
        name: 'manager',
        type: 'list',
        message: 'Select the manager you want to assign to this employee!',
        choices: managers,
      }
    ]).then((data) => {
    
      connection.query(`SELECT id from employee WHERE CONCAT(first_name, " " , last_name) = "${data.manager}"`, async (err, res)  => {
        if(err) throw err;
        managerID = res[0].id;
         connection.query(`UPDATE employee SET manager_id = ${managerID} WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`, async (err,res) => {
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
        choices: employees,
      },
      {
        name: 'role',
        type: 'list',
        message: 'Select the role you want to assign to this employee',
        choices: roles,
      }
    ]).then((data)=> {
        connection.query(`UPDATE employee SET role_id = (SELECT id FROM role WHERE title = "${data.role}") WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`, (err,res)=> {
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
        choices: [employees]
      }
    ]).then((data)=> {
        connection.query(`DELETE FROM employee WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`, (err,res)=> {
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
      connection.query(`INSERT INTO department(name) VALUES ("${data.dept}")`, (err,res) => {
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
        choices: departments,
      }
    ]).then((data) =>{
      connection.query(`INSERT INTO role(title,salary,department_id) VALUES ("${data.role}",${data.salary},
      (SELECT id FROM department WHERE name = "${data.dept}"))`, (err,res) => {
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
  
    inquirer.prompt([
      {
        name: 'first_name',
        type: 'input',
        message: 'Enter the Employee\'s First Name!'
      },
      {
        name: 'last_name',
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
      connection.query(`SELECT id FROM role WHERE title = "${empdata.roles}"`, (err,res) => {
        if(err) throw err;
        roleID = res[0].id;
      });
      connection.query(`SELECT id FROM employee WHERE CONCAT(first_name, " " , last_name) = ?`,[empdata.manager], (err,res) => {
        if(err) throw err;
        managerID = res[0].id;
          connection.query(`INSERT INTO employee(first_name,last_name,role_id,manager_id)
          VALUES ("${empdata.first_name}","${empdata.last_name}",${roleID},${managerID})`, (err,res) => {
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
      connection.query(`SELECT e.id, e.first_name, e.last_name, r.title,
      d.name as department, r.salary, CONCAT(e2.first_name, " " ,e2.last_name) as manager
      FROM department d JOIN role r ON d.id = r.department_id 
      JOIN employee e ON r.id = e.role_id
      LEFT JOIN employee e2 ON e.manager_id = e2.id
      where d.name = ?
      ORDER BY d.name, e.last_name`,[answer.dept],(err, res) => {
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
        connection.query(`SELECT * FROM employee WHERE manager_id = 
        (SELECT id FROM employee WHERE CONCAT(first_name, " " ,last_name) ="${answer.mgr}")`,(err, res) => {
          if(err) throw err;
          displayTable(res);
        });
      });
  };
  
  const displayTable = (data) => {
    console.log(table.getTable(data));
    promptUser()
  };

  connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    promptUser();
  });

  

  
  


  



  