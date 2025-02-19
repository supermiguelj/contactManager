
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
        $checkStmt = $database->prepare("SELECT * FROM Contacts WHERE ID = ? AND name = ? AND email = ? AND phone = ?");
		$checkStmt->bind_param("isss", $inData["userID"], $inData["name"], $inData["email"], $inData["phone"]);	
        $checkStmt->execute();
        $checkStmt->store_result();
        
        if ($checkStmt->num_rows > 0) {
            returnWithInfo( false, "Contact already exists!" );

            $checkStmt->close();
            $database->close();

            exit();
        }
        $checkStmt->close();

		$dateCreated = isset($inData["oldDate"]) && !empty($inData["oldDate"]) ? $inData["oldDate"]: date("Y-m-d H:i:s");

		$prepstmt = $database->prepare("INSERT INTO Contacts (ID, DateCreated, name, email, phone, contactID) VALUES (?, ?, ?, ?, ?, ?)");
		$prepstmt->bind_param("issssi", $inData["userID"], $dateCreated, $inData["name"], $inData["email"], $inData["phone"], $inData["conID"]);
		$prepstmt->execute();
		
		$prepstmt = $database->prepare("SELECT DateCreated FROM Contacts WHERE contactID=?");
		$prepstmt->bind_param("i", $inData["conID"]);
		$prepstmt->execute();

		$result = $prepstmt->get_result();
		$row = $result->fetch_assoc();

		returnWithInfo( true, $row["DateCreated"], "Contact successfully added" );
		
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
		echo json_encode($obj);
	}

	function returnWithInfo( $state, $date, $msg )
	{
		$retValue = [
			"success" => $state,
			"conDate" => $date,
			"msg" => $msg
		];
		
		sendResultInfoAsJson( $retValue );
	}
	
?>
