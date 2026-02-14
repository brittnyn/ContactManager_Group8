<?php
	$inData = getRequestInfo();

	$id = isset($inData["id"]) ? (int)$inData["id"] : 0;
	$userId = isset($inData["userId"]) ? (int)$inData["userId"] : 0;

	if ($id <= 0 || $userId <= 0)
	{
		returnWithError("Invalid contact or user id.");
		exit();
	}

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Delete only the row owned by this logged-in user.
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID=? AND UserID=?");
		$stmt->bind_param("ii", $id, $userId);
		$stmt->execute();

		if ($stmt->errno)
		{
			returnWithError($stmt->error);
		}
		else if ($stmt->affected_rows < 1)
		{
			// No row matched this (ID, UserID) pair.
			returnWithError("Contact not found or not owned by user.");
		}
		else
		{
			returnWithInfo("Contact deleted");
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
