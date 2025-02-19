<?php

	$inData = getRequestInfo();
	
	$searchResults = [];

	$database = new mysqli("localhost", "Test", "Dummy", "Manager");
	if ($database->connect_error) 
	{
		returnWithError( $database->connect_error );
	} 
	else
	{
		$prepStmt = $database->prepare("SELECT * FROM Contacts WHERE ID=? ORDER BY `DateCreated` DESC");
		$prepStmt->bind_param("i", $inData["userID"]);
		$prepStmt->execute();
		
		$result = $prepStmt->get_result();
		
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
		
		if( $result->num_rows == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults, $result->num_rows );
		}
		
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
	
	function returnWithError( $err )
	{
		$retValue = '{
			"searches": 0,
			"msg":"' . $err . '"
		}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults, $rowCount )
	{
		$retValue = [
			"results" => $searchResults,
			"searches" => $rowCount
		];

		sendResultInfoAsJson( $retValue );
	}
	
?>