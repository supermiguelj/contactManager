
<?php

	$inData = getRequestInfo();

	$database = new mysqli("localhost", "Test", "Dummy", "Manager");
	if( $database->connect_error )
	{
		returnWithError( $database->connect_error );
	}
	else
	{
		$prepStmt = $database->prepare("UPDATE Contacts SET name=?, email=?, phone=? WHERE contactID=?");
		$prepStmt->bind_param("sssi", $inData["name"], $inData["email"], $inData["phone"], $inData["conID"]);
		$prepStmt->execute();

        returnWithInfo("Successfully updated contact");

		$prepStmt->close();
		$database->close();
	}
	
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo json_encode( $obj );
	}
	
	function returnWithInfo( $msg )
	{
		$retValue = $retValue = [
			"msg" => $msg
		];
		
		sendResultInfoAsJson( $retValue );
	}
	
?>
