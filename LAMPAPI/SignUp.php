
<?php

	$inData = getRequestInfo();
	
	$id = 0;
	$firstName = "";
	$lastName = "";

	$database = new mysqli("localhost", "Test", "Dummy", "Manager");
	if( $database->connect_error )
	{
		returnWithError( $database->connect_error );
	}
	else
	{
        // Check if the username already exists
        $checkStmt = $database->prepare("SELECT * FROM Users WHERE username=?");
        $checkStmt->bind_param("s", $inData["username"]);
        $checkStmt->execute();
        $checkStmt->store_result();
        
        if ($checkStmt->num_rows > 0) {
            returnWithError("Username already taken");
            $checkStmt->close();
            $database->close();
            exit();
        }
        $checkStmt->close();

        // Securely hash the password before storing it
        $hashedPassword = password_hash($inData["password"], PASSWORD_BCRYPT, ["cost" => 12]);

		$prepstmt = $database->prepare("INSERT INTO Users (firstName, lastName, username, password) VALUES (?, ?, ?, ?)");
		$prepstmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["username"], $hashedPassword);
		$prepstmt->execute();

		sendResultInfoAsJson('{
			"id": 1, 
			"msg":"Registration created successfully"
		}');

		$prepstmt->close();
		$database->close();
	}
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{
			"id": 0, 
			"firstName": "", 
			"lastName": "", 
			"err":"' . $err . '"
		}';
		
		sendResultInfoAsJson( $retValue );
	}
	
?>
