<?php
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type");
    

    // Gets POST request from searchContact() function in code.js
    $inData = getRequestInfo();
    
    // Connects to MariaDB
    $database = new mysqli("localhost", "Test", "Dummy", "Manager");

    if ( $database->connect_error ) { // Invalid connection
		die(json_encode(["success" => false, "message" => $database->connect_error]));
	} else { // Connection Established
        // Cleans the search (% allows for incomplete words)
        $name = "%" . $database->real_escape_string($inData->name) . "%";
        // Prepares query to search for contact by name
        $prepStmt = $database->prepare("SELECT id, name, email, phone FROM Contacts WHERE name LIKE ?");
        $prepStmt->bind_param("s", $name);
        $prepStmt->execute();

        $contacts = [];
        // Stores result for retrieval
        $result = $prepStmt->get_result();

        // Packages result into JSON to deliver back to searchContact() in front end
        while($row = $result->fetch_assoc()) {
			$contacts[] = $row;
		}

        $prepStmt->close();
        $database->close();

        // Return JSON response
        if (count($contacts) > 0) {
            echo json_encode(["success" => true, "contacts" => $contacts]);
        } else {
            echo json_encode(["success" => false, "message" => "No contacts found."]);
        }
    }

    // Used to unpack and retrieve raw JSON output
    function getRequestInfo() {
		return json_decode(file_get_contents('php://input'), true);
	}

    // Sends back the results as JSON
	function sendResultInfoAsJson($obj) {
		header('Content-type: application/json');
		echo $obj;
	}
?>