-- mariadb -u yourusername -p

-- create the database
create database Manager;
use Manager;

-- create 'Users' table
CREATE TABLE IF NOT EXISTS `Manager`.`Users`
(
`ID` INT NOT NULL AUTO_INCREMENT,
`DateCreated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`firstName` VARCHAR(50) NOT NULL DEFAULT '',
`lastName` VARCHAR(50) NOT NULL DEFAULT '',
`username` VARCHAR(50) NOT NULL DEFAULT '',
`password` VARCHAR(255) NOT NULL DEFAULT '',
PRIMARY KEY (`ID`)
) ENGINE = InnoDB;

-- create 'Contacts' table
CREATE TABLE IF NOT EXISTS `Manager`.`Contacts`
(
`ID` INT NOT NULL DEFAULT 0,
`DateCreated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
`name` VARCHAR(50) NOT NULL DEFAULT '',
`email` VARCHAR(50) NOT NULL DEFAULT '',
`phone` VARCHAR(50) NOT NULL DEFAULT '',
`contactID` INT NOT NULL DEFAULT 0,
PRIMARY KEY (`ID`)
-- FOREIGN KEY (`userID`) REFERENCES users(`ID`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- insert sample data into 'Users' table
INSERT INTO Users (firstName, lastName, username, password) VALUES
('John', 'Doe', 'johndoe', 'password123'),
('Jane', 'Doe', 'janedoe', '321drowssap'),
('Test', 'Dummy', 'test', 'dummy');

-- insert sample data into 'Contacts' table
INSERT INTO Contacts (ID, name, email, phone, contactID) VALUES
(1, 'Bob Ross', 'RossBob@gmail.com', '1234567890','12345'),
(1, 'Professor Gerber', 'GerberProf123@yahoo.com', '1010101010','67890'),
(2, 'Test Dummy', 'testdummy@example.com', '0987654321','13579');

-- display table
SELECT * FROM Users;
SELECT * FROM Contacts;

-- database user
CREATE USER 'Test' IDENTIFIED BY 'Dummy';
GRANT ALL PRIVILEGES ON Manager.* TO 'Test'@'%';
