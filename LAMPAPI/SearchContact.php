<?php
    // Gets POST request from searchContact() function in code.js
    $inData = getRequestInfo();

    $searchResults = [];
    
    // Connects to MariaDB
    $database = new mysqli("localhost", "Test", "Dummy", "Manager");

    if ($database->connect_error) 
	{
		returnWithError( $database->connect_error );
	}
    else // Connection Established
    {
        // % allows for incomplete words
        $name = "%" . $inData["name"] . "%";

        // Prepares query to search for contact by name
        $prepStmt = $database->prepare("SELECT * FROM Contacts WHERE name LIKE ? AND ID=? ORDER BY `DateCreated` DESC");
        $prepStmt->bind_param("si", $name, $inData["userID"]);
        $prepStmt->execute();

        // Stores result for retrieval
        $result = $prepStmt->get_result();

        // Packages result into JSON to deliver back to searchContact() in front end
        while($row = $result->fetch_assoc())
		{
			$searchResults[] = [
				"name" => $row["name"],
				"email" => $row["email"],
				"phone" => $row["phone"],
				"contactID" => $row["contactID"],
				"conDate" => $row["DateCreated"]
			];
		}

        // Return JSON response
        if( $result->num_rows == 0 )
		{
			returnWithError( false, "No Records Found" );
		}
		else
		{
			returnWithInfo( true, $searchResults, $result->num_rows );
		}

        $prepStmt->close();
        $database->close();
    }

        // Used to unpack and retrieve raw JSON output
        function getRequestInfo()
        {
            return json_decode(file_get_contents('php://input'), true);
        }

        // Sends back the results as JSON
        function sendResultInfoAsJson( $obj )
        {
            header('Content-type: application/json');
            echo json_encode( $obj );
        }
        
        function returnWithError( $state, $msg )
        {
            $retValue = [
                "success" => $state,
                "searches" => 0,
                "msg" => $msg
            ];
            
            sendResultInfoAsJson( $retValue );
        }
        
        function returnWithInfo( $state, $searchResults, $rowCount )
        {
            $retValue = [
                "success" => $state,
                "searches" => $rowCount,
                "results" => $searchResults
            ];

            sendResultInfoAsJson( $retValue );
        }

?>
