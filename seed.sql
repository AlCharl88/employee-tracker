use employees_db;

INSERT INTO department (name)
VALUES 
('Executive'), 
('Management'), 
('Technical_Service'), 
('Quality_Control'), 
('Synthesis'), 
('Production');

INSERT INTO role (title, salary, department_id)
VALUES 
('CEO', 250000, 1), 
('General Manager', 200000, 2), 
('Team Manager', 150000, 2), 
('Technical Representative', 60000, 3), 
('QC Secilaist', 70000, 4), 
('Research Scientist', 90000, 5),
('Production Operative', 50000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Sabrina', 'Falou', 1, NULL), 
('Melanie', 'Fox', 2, 1), 
('Albert', 'Larro', 3, 2), 
('John', 'Soule', 4, NULL), 
('Harry', 'Tabo', 5, NULL), 
('Christoph', 'Malox', 6, NULL),
('Jerom', 'Mouga', 6, NULL);  