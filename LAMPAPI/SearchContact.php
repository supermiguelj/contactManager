<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$inData = getRequestInfo();

$database = new mysqli("localhost", "Test", "Dummy", "Manager");

if ($database->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $database->connect_error]));
}

$name = "%" . $database->real_escape_string($inData["name"]) . "%";

$prepStmt = $database->prepare("SELECT id, name, email, phone FROM Contacts WHERE name LIKE ?");
$prepStmt->bind_param("s", $name);
$prepStmt->execute();

$contacts = [];
$result = $prepStmt->get_result();

while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

$prepStmt->close();
$database->close();

if (!empty($contacts)) {
    echo json_encode(["success" => true, "contacts" => $contacts]);
} else {
    echo json_encode(["success" => false, "message" => "No contacts found."]);
}

function getRequestInfo() {
    return json_decode(file_get_contents("php://input"), true);
}
?>
