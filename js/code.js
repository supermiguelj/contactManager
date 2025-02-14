const urlBase = 'http://manager.spicyramen.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let users = []

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

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
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
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
	else if (phoneRegex.test(phone))
	{
		document.getElementById("contactAddResult").innerHTML = "Not a valid phone number!";
		return false;
	}

	return true;
}

function addContact()
{
	let contactName = document.getElementById("conName").value;
	let contactEmail = document.getElementById("conEmail").value;
	let contactPhone = document.getElementById("conPhone").value;

	if (!checkValidContact(contactName, contactEmail, contactPhone)) return;
	
	document.getElementById("contactAddResult").innerHTML = "";

	// Generates userID
	let tempUserID = Math.floor(Math.random() * 90000) + 1000;

	// Used to check if generated userID has been taken by previous contact or not
	// I'll handle this tomorrow ~ Miguel

	// Injects payload
	let jsonPayload = JSON.stringify({
		name: contactName,
        email: contactEmail,
		phone: contactPhone,
        userID: tempUserID,
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
				document.getElementById("conName").value = "";
				document.getElementById("conEmail").value = "";
				document.getElementById("conPhone").value = "";

				document.getElementById("contactAddResult").innerHTML = "Contact has been added";

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

function displayContacts()
{
	document.getElementById("contactSearches").innerHTML = "";
	document.getElementById("contactAddResult").innerHTML = "";
	document.getElementById("contactList").innerHTML = "";
	
	let listOfContacts = "";

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

				document.getElementById("contactSearches").innerHTML = 
				(jsonObject.searches === 0) ? jsonObject.err : jsonObject.searches + " entries";
				
				for( let i = 0; i < jsonObject.searches; i++ )
				{
					contact = jsonObject.results[i];
					users.push(jsonObject.userID);

					listOfContacts += `
						<div class="contactInfo" id="${contact.userID}">
							<h3 id="name">${contact.name}</h3>
							<p><strong>Email:</strong></p>
							<p id="email"> ${contact.email}</p>
							<p><strong>Phone:</strong> </p>
							<p id="phone"> ${contact.phone}</p>
							<button onclick="editContact(this);">Edit</button>
							<button onclick="deleteContact(this);">Delete</button>
						</div>
						<hr>
					`;
				}
				
				document.getElementById("contactList").innerHTML = listOfContacts;
			}
		};
		xhr.send();
	}
	catch(err)
	{
		document.getElementById("contactSearches").innerHTML = err.message;
	}
	
}

function editContact(btn) 
{
	let name = btn.parentNode.querySelector("#name").innerText.trim();
    let email = btn.parentNode.querySelector("#email").innerText.trim(); 
    let phone = btn.parentNode.querySelector("#phone").innerText.trim();
    const userID = btn.parentNode.id; // Get user ID from div ID

	btn.parentNode.innerHTML = `
		<div id="editForm">
			<h3>Edit Contact</h3>
			<input type="hidden" id="editUserID">
			<input type="text" id="editName" value="${name}">
			<input type="email" id="editEmail" value="${email}">
			<input type="text" id="editPhone" value="${phone}">
			<button onclick="saveEdit(this, ${userID});">Save</button>
			<button onclick="displayContacts();">Cancel</button>
		</div>
	`;
}

function saveEdit(btn, userID) {
	let url = urlBase + '/UpdateContact.' + extension;

	let newName = btn.parentNode.querySelector("#editName").value.trim();
	let newEmail = btn.parentNode.querySelector("#editEmail").value.trim();
	let	newPhone = btn.parentNode.querySelector("#editPhone").value.trim(); 

	if (!checkValidContact(newName, newEmail, newPhone)) return;

	let jsonPayload = JSON.stringify({
        name: newName, 
        email: newEmail, 
		phone: newPhone, 
		userNum: parseInt( userID )
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

function deleteContact(userID) 
{
	// Are you sure??
	let url = urlBase + '/DeleteContact.' + extension;

	let jsonPayload = JSON.stringify({
        userID: parseInt( userID.parentNode.id )
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

				userID.parentNode.remove();
				document.getElementById("contactSearches").innerHTML = jsonObject.msg;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearches").innerHTML = err.message;
	}
}
