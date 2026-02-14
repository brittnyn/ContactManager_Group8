<?php
	$inData = getRequestInfo();

	$id = (int)$inData["id"];
	$userId = (int)$inData["userId"];
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Update only the contact owned by the logged-in user.
		$stmt = $conn->prepare("UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=? AND UserID=?");
		$stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $id, $userId);
		$stmt->execute();

		if ($stmt->errno)
		{
			returnWithError($stmt->error);
		}
		else
		{
			// Treat unchanged values as success so UI can exit edit mode gracefully.
			returnWithInfo("Contact updated");
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	function returnWithInfo($message)
	{
		$retValue = '{"message":"' . $message . '","error":""}';
		sendResultInfoAsJson($retValue);
	}
?>
