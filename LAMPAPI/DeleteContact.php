
<?php

	$inData = getRequestInfo();

	$database = new mysqli("localhost", "Test", "Dummy", "Manager");
	if( $database->connect_error )
	{
		returnWithError( $database->connect_error );
	}
	else
	{
		$prepStmt = $database->prepare("DELETE FROM Contacts WHERE contactID=?");
		$prepStmt->bind_param("i", $inData["contactID"]);
		$prepStmt->execute();

        returnWithInfo("Successfully deleted contact");

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
		echo $obj;
	}
	
	function returnWithInfo( $msg )
	{
		$retValue = '{
			"msg":"' . $msg . '"
		}';
		
		sendResultInfoAsJson( $retValue );
	}
	
?>
