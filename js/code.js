const urlBase = 'http://manager.spicyramen.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

var selectState = null;
var historyHead = null;

let oldContact = null;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

class contactHistory
{
	constructor(user, name, email, phone, id, date, action)
	{
		this.user = user;
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.id = id
		this.date = date;
		this.action = action;
		this.prev = null;
		this.next = null;
	}
}

function updateState(state)
{
	if (state === null) 
	{
		historyHead = new contactHistory(null, null, null, null, null, null, null);
		selectState = historyHead;
		return;
	}

	if (!(state.prev === null) && state.next === null)
	{
		document.getElementById("undo").disabled = false;
		document.getElementById("redo").disabled = true;
	}
	else if (state.prev === null && !(state.next === null))
	{
		document.getElementById("undo").disabled = true;
		document.getElementById("redo").disabled = false;
	}
	else if (!(state.prev === null) && !(state.next === null))
	{
		document.getElementById("undo").disabled = false;
		document.getElementById("redo").disabled = false;
	}
	else if (state.prev === null && state.next === null)
	{
		document.getElementById("undo").disabled = true;
		document.getElementById("redo").disabled = true;
	}
}

function doLogin()
{
	// Reset global user variables before attempting login
	userId = 0;
	firstName = "";
	lastName = "";
	
	// Get the username and password entered by the user from the input fields
	let login = document.getElementById("loginUsername").value;
	let password = document.getElementById("loginPassword").value;

	if (login.length === 0 || password.length === 0)
	{
		document.getElementById("loginResult").innerHTML = "No empty field(s) please";
		return;
	}
	
	// Clear any previous login result messages
	document.getElementById("loginResult").innerHTML = "";

	// Convert the object JSON object containing the login credentials into a JSON string to send in the request body
	let jsonPayload = JSON.stringify({
		username: login, 
		password: password
	});
	
	// Define the URL endpoint for login
	let url = urlBase + '/Login.' + extension;

	// Create a new XMLHttpRequest object for making the HTTP request
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true); // Open a POST request to the login endpoint
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8"); // Set the content type to JSON

	try
	{
		// Define the callback function that will run when the request state changes
		xhr.onreadystatechange = function() 
		{
			// Check if the request has completed successfully
			if (this.readyState == 4 && this.status == 200) 
			{
				// Parse the JSON response from the server
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id; // Extract the user ID from the response

				// Clear password field
				document.getElementById("loginPassword").value = "";
		
				// If user ID is invalid (login failed), display an error message
				if (userId == 0)
				{		
					document.getElementById("loginResult").innerHTML = jsonObject.msg;
					return;
				}
		
				// Store user details retrieved from the response
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				// Save login details in cookies for future sessions
				saveCookie();
	
				// Redirect user to the contacts page upon successful login
				window.location.href = "contacts.html";
			}
		};

		// Send the JSON payload containing login credentials to the server
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		// Handle any unexpected errors by displaying an error message to the user
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doSignUp()
{
	// Get user input from form fields
	let firstName = document.getElementById("registerFirstName").value;
    let lastName = document.getElementById("registerLastName").value;
    let username = document.getElementById("registerUsername").value;
    let password = document.getElementById("registerPassword").value;
	
	document.getElementById("registerResult").innerHTML = "";

	if (firstName.length === 0 || lastName.length === 0 || username.length === 0 || password.length === 0)
	{
		document.getElementById("registerResult").innerHTML = "No empty field(s) please";
        return;
	}
    else if (password.length < 6) {
        document.getElementById("registerResult").innerHTML = "Password must be at least 6 characters.";
        return;
    }

	let jsonPayload = JSON.stringify({
		firstName: firstName,
        lastName: lastName,
		username: username,
        password: password, // (hashed in PHP)
	});
	
	let url = urlBase + '/SignUp.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;

				if (userId == 0)
				{
					document.getElementById("registerResult").innerHTML = "Something went wrong..";
        			return;
				}
				else 
				{
					document.getElementById("registerResult").innerHTML = jsonObject.msg;
					// sleep?
					window.location.href = "login.html";
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + (minutes * 60 * 1000));	
	document.cookie = 
		"firstName=" + firstName + 
		",lastName=" + lastName + 
		",userId=" + userId + 
		";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;

	// Ex. ["firstName=John", " lastName=Doe", " userId=123"]
	let splits = data.split(",");

	// Loop through each cookie entry in the splits array
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");

		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId <= 0 )
	{
		window.location.href = "login.html";
		document.getElementById("loginResult").innerHTML = "You're not allowed to be there";
	}
	else
	{
		displayContacts();
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";

	window.location.href = "login.html";
	document.getElementById("loginResult").innerHTML = "Successfully logged out!";
}

function checkValidContact(name, email, phone)
{
	if (name.length === 0 || email.length === 0 || phone.length === 0)
	{
		document.getElementById("contactAddResult").innerHTML = "No empty field(s) please!";
		return false;
	}
	else if (!emailRegex.test(email))
	{
		document.getElementById("contactAddResult").innerHTML = "Not a valid email address!";
		return false;
	}
	else if (!phoneRegex.test(phone))
	{
		document.getElementById("contactAddResult").innerHTML = "Not a valid phone number!";
		return false;
	}

	return true;
}

function addContact(state, oldID = null, conDate = null)
{
	let contactName = document.getElementById("conName").value;
	let contactEmail = document.getElementById("conEmail").value;
	let contactPhone = document.getElementById("conPhone").value;

	if (!checkValidContact(contactName, contactEmail, contactPhone)) return;
	
	document.getElementById("contactAddResult").innerHTML = "";

	// Generates contactID
	let tempContactID = Math.floor(Math.random() * 90000) + 10000;

	// Used to check if generated contactID has been taken by previous contact or not
	// I'll handle this tomorrow ~ Miguel

	// Injects payload
	let jsonPayload = JSON.stringify({
		userID: userId,
		oldDate: conDate,
		name: contactName,
        email: contactEmail,
		phone: contactPhone,
        conID: (oldID == null) ? tempContactID : oldID
	});

	let url = urlBase + '/CreateContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );

				if (jsonObject.success) 
				{
					document.getElementById("contactAddResult").innerHTML = jsonObject.msg;
				}
				else
				{
					document.getElementById("contactAddResult").innerHTML = jsonObject.msg;
					return;
				}

				document.getElementById("conName").value = "";
				document.getElementById("conEmail").value = "";
				document.getElementById("conPhone").value = "";

				if (state && historyHead.next == null)
				{
					let temp = new contactHistory(userId, contactName, contactEmail, contactPhone, tempContactID, jsonObject.conDate, "add");
					historyHead = selectState;
					temp.prev = historyHead;
					historyHead.next = temp;

					historyHead = historyHead.next;
					selectState = historyHead;
					updateState(selectState);
				}

				displayContacts();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}

}
/*
sortTable(val) 
{

}
*/
function createContactList(parsedContacts)
{
	let listOfContacts = `
		<tr>
			<th onclick="sortTable(1);">Name</th>
			<th onclick="sortTable(2);">Email</th>
			<th onclick="sortTable(3);">Phone</th>
			<th>???</th>
			<th>???</th>
		</tr>
	`;

	document.getElementById("contactSearches").innerHTML = 
	(parsedContacts.searches === 0) ? parsedContacts.msg : parsedContacts.searches + " entries";
	
	for( let i = 0; i < parsedContacts.searches; i++ )
	{
		contact = parsedContacts.results[i];

		listOfContacts += `
			<tr class="contactInfo" id="${contact.contactID}">
				<td id="name">${contact.name}</td>
				<td id="email">${contact.email}</td>
				<td id="phone">(${(contact.phone).slice(0, 3)}) ${(contact.phone).slice(3, 6)}-${(contact.phone).slice(6, 10)}</td>
				<td><button onclick="editContact(${contact.contactID}, ${contact.conDate});">Edit</button></td>
				<td><button onclick="deleteContact(${contact.contactID}, ${contact.conDate}, true);">Delete</button></td>
			</tr>
		`;
	}
	
	document.getElementById("contactList").innerHTML = listOfContacts;
}

function displayEdits()
{
	let curr = historyHead;
	let list = "";
	while (curr !== null)
	{
		if (curr.action === "add")
		{
			list += `<li>Name: <strong>${curr.name}</strong> with ${curr.id} was added</li><br />`;
		}
		else if (curr.action === "edit")
		{
			list += `<li>Name: <strong>${curr.prev.name}</strong> changed to ${curr.name}</li><br />`;
			curr = curr.prev;
		}
		else if (curr.action === "delete")
		{
			list += `<li>Name: <strong>${curr.name}</strong> with ${curr.id} was deleted</li><br />`;
		}
		else
		{
			list += `<li>Default</li><br />`;
		}

		if (curr == selectState || (curr.action === "edit" && curr == selectState.prev))
		{
			list += `<li>^ Current state ^</li><br />`;
		}
		
		curr = curr.prev;
	}

	// console.log(historyHead);
	document.getElementById("editList").innerHTML = list;
}

function displayContacts()
{
	document.getElementById("contactSearches").innerHTML = "";
	document.getElementById("contactAddResult").innerHTML = "";
	document.getElementById("contactList").innerHTML = "";

	let url = urlBase + '/ReadContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );

				createContactList(jsonObject);
				displayEdits();
			}
		};
		xhr.send();
	}
	catch(err)
	{
		document.getElementById("contactSearches").innerHTML = err.message;
	}
	
}

// Searches for contact by nameu using API to communicate with MariaDB
function searchContact()
{
	// gets contact name from the contact search bar using ID
	let contactName = document.getElementById("searchContact").value.trim();

	// Returns default table if search bar is blank
	if (contactName.length === 0) 
	{
		displayContacts(); 
		return;
	}
	
	// Injects payload
	let jsonPayload = JSON.stringify({
		name: contactName,
		userID: userId
	});
	
	// Holds the url to the correct API endpoint
	let url = urlBase + '/SearchContact.' + extension;
	// Allows for information to be retrieved without refreshing page
	let xhr = new XMLHttpRequest();
	// Sets request address and command to the designated url for the correct API endpoint and to POST
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	// handles API response
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
	
				// Valid SQL query was retrieved
				if (jsonObject.success) 
				{
					createContactList(jsonObject);
				} 
				else // Nothing found
				{
					// Displays nothing
					document.getElementById("contactAddResult").innerHTML = jsonObject.msg;
				}
			}
		};
		// Sends POST request of the json containing the name from the contact search bar to be used by the API
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
}

function editContact(btn, oldDate) 
{
	let contactTable = document.getElementById(btn);

	let name = contactTable.querySelector("#name").innerText.trim();
    let email = contactTable.querySelector("#email").innerText.trim(); 
    let phone = contactTable.querySelector("#phone").innerText.trim().replace(/\D/g, "");
    const contactID = btn;

	oldContact = new contactHistory(userId, name, email, phone, contactID, oldDate, "edit");

	contactTable.innerHTML = `
		<tr id="editForm">
			<td><input type="text" id="editName" value="${name}"></td>
			<td><input type="email" id="editEmail" value="${email}"></td>
			<td><input type="text" id="editPhone" value="${phone}"></td>
			<td><button onclick="saveEdit(this, ${contactID}, null, ${oldDate});">Save</button></td>
			<td><button onclick="displayContacts();">Cancel</button></td>
		</tr>
	`;
}

function saveEdit(btn, contactID, state, oldDate) {
	let url = urlBase + '/UpdateContact.' + extension;
	let newName = newEmail = newPhone = null;

	if (state === null)
	{
		newName = btn.closest("tr").querySelector("#editName").value.trim();
		newEmail = btn.closest("tr").querySelector("#editEmail").value.trim();
		newPhone = btn.closest("tr").querySelector("#editPhone").value.trim();
	}
	else if (state === "prev")
	{
		selectState = selectState.prev;

		newName = selectState.name;
		newEmail = selectState.email;
		newPhone = selectState.phone;

		updateState(selectState);
	}
	else if (state === "next") // duplicates ??
	{
		selectState = selectState.next;

		newName = selectState.next.name;
		newEmail = selectState.next.email;
		newPhone = selectState.next.phone;

		updateState(selectState);
	}

	if (!checkValidContact(newName, newEmail, newPhone)) return;

	if (state === null && oldContact.name === newName && oldContact.email === newEmail && oldContact.phone === newPhone) 
	{
		document.getElementById("contactAddResult").innerHTML = "Cannot be same contact!";
		return;
	}

	let jsonPayload = JSON.stringify({
        name: newName, 
        email: newEmail, 
		phone: newPhone, 
		conID: parseInt( contactID )
	});

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				document.getElementById("contactAddResult").innerHTML = jsonObject.msg;

				if (state === null && historyHead.next == null)
				{
					let temp = new contactHistory(userId, newName, newEmail, newPhone, contactID, oldDate, "edit");

					historyHead = selectState;

					temp.prev = oldContact;
					oldContact.next = temp;
					oldContact.prev = historyHead;
					historyHead.next = oldContact;

					historyHead = historyHead.next.next;
					selectState = historyHead;
					updateState(selectState);
				}

				displayContacts();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
}

function deleteContact(contactID, state, oldDate) 
{
	// Are you sure??
	let url = urlBase + '/DeleteContact.' + extension;

	let jsonPayload = JSON.stringify({
        contactID: parseInt( contactID )
	});

	if (state && historyHead.next == null)
	{
		let name = document.getElementById(contactID).querySelector("#name").innerText.trim();
		let email = document.getElementById(contactID).querySelector("#email").innerText.trim(); 
		let phone = document.getElementById(contactID).querySelector("#phone").innerText.trim();
		
		let temp = new contactHistory(userId, name, email, phone, contactID, oldDate, "delete");
		historyHead = selectState; // Clear redo's and go back to current selectState
		temp.prev = historyHead;
		historyHead.next = temp;

		historyHead = historyHead.next;
		selectState = historyHead;
		updateState(selectState);
	}

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );

				document.getElementById(contactID).remove();
				document.getElementById("contactSearches").innerHTML = jsonObject.msg;

				displayContacts();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearches").innerHTML = err.message;
	}
}

function reverse()
{
	if (selectState.action == "add")
	{
		deleteContact(selectState.id, selectState.date, false);
	}
	else if (selectState.action == "edit")
	{
		// back to old name
		saveEdit(null, selectState.id, "prev", selectState.date);
	}
	else if (selectState.action == "delete")
	{
		document.getElementById("conName").value = selectState.name;
		document.getElementById("conEmail").value = selectState.email;
		document.getElementById("conPhone").value = selectState.phone;
		addContact(false, selectState.id, selectState.date);
	}

	selectState = selectState.prev;
	updateState(selectState);
	// console.log(selectState);
}

function forward()
{
	if (selectState.next.action == "add")
	{
		document.getElementById("conName").value = selectState.next.name;
		document.getElementById("conEmail").value = selectState.next.email;
		document.getElementById("conPhone").value = selectState.next.phone;
		addContact(false, selectState.next.id, selectState.next.date);
	}
	else if (selectState.next.action == "edit")
	{
		// back to new name
		saveEdit(null, selectState.next.id, "next", selectState.next.date);
	}
	else if (selectState.next.action == "delete")
	{
		deleteContact(selectState.next.id, selectState.next.date, false);
	}

	selectState = selectState.next;
	updateState(selectState);
	// console.log(selectState);
}
