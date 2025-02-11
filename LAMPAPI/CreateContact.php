
<?php

	$inData = getRequestInfo();

	$database = new mysqli("localhost", "Test", "Dummy", "Manager");
	if( $database->connect_error )
	{
		returnWithError( $database->connect_error );
	}
	else
	{
		$prepstmt = $database->prepare("INSERT INTO Contacts (name, email, phone, userID) VALUES (?, ?, ?, ?)");
		$prepstmt->bind_param("sssi", $inData["name"], $inData["email"], $inData["phone"], $inData["userID"]);
		$prepstmt->execute();
		
		returnWithError("");
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
		$retValue = '{"err":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
