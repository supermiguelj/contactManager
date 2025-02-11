
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
		$prepStmt = $database->prepare("SELECT ID, firstName, lastName, password FROM Users WHERE username LIKE ?");
		$prepStmt->bind_param("s", $inData["username"]);
		$prepStmt->execute();
		$result = $prepStmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			$storedHash = $row["password"]; // Retrieve hashed password from DB

			// Use password_verify() to check the entered password against the stored hash
			if (password_verify($inData["password"], $storedHash)) {

				// If password is correct, return user details
				returnWithInfo(
					$row["firstName"],
					$row["lastName"],
					$row["ID"]
				);
			} 
			else 
			{
				returnWithError("Invalid username or password.");
			}
		}
		else
		{
			returnWithError("Invalid username or password.");
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
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{ 
			"id":' . $id . ', 
			"firstName":"' . $firstName . '", 
			"lastName":"' . $lastName . '", 
			"err":"" 
		}';

		sendResultInfoAsJson( $retValue );
	}
	
?>
