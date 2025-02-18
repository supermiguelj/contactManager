
<?php

	$inData = getRequestInfo();

	$database = new mysqli("localhost", "Test", "Dummy", "Manager");
	if( $database->connect_error )
	{
		returnWithError( $database->connect_error );
	}
	else
	{
		// Check if the contact already exists
        $checkStmt = $database->prepare("SELECT * FROM Contacts WHERE name = ? AND email = ? AND phone = ?");
		$checkStmt->bind_param("sss", $inData["name"], $inData["email"], $inData["phone"]);	
        $checkStmt->execute();
        $checkStmt->store_result();
        
        if ($checkStmt->num_rows > 0) {
            returnWithInfo(false, "Contact already exists!");

            $checkStmt->close();
            $database->close();

            exit();
        }
        $checkStmt->close();

		$prepstmt = $database->prepare("INSERT INTO Contacts (name, email, phone, userID) VALUES (?, ?, ?, ?)");
		$prepstmt->bind_param("sssi", $inData["name"], $inData["email"], $inData["phone"], $inData["userID"]);
		$prepstmt->execute();

		returnWithInfo(true, "Contact successfully added");
		
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

	function returnWithInfo( $state, $msg )
	{
		$retValue = '{
			"success:' . $state . ',
			"msg":"' . $msg . '"
		}';
		
		sendResultInfoAsJson( $retValue );
	}
	
?>
