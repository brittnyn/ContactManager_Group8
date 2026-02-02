const urlBase = 'http://adamdisanti.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let contacts = [];

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";

	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;

	document.getElementById("loginResult").innerHTML = "";

	let tmp = { login: login, password: password };
	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if (this.readyState === 4 && this.status === 200)
		{
			let jsonObject = JSON.parse(xhr.responseText);
			userId = jsonObject.id;

			if (userId < 1)
			{
				document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
				return;
			}

			firstName = jsonObject.firstName;
			lastName = jsonObject.lastName;
			saveCookie();
			window.location.href = "contact.html";
		}
	};
	xhr.send(jsonPayload);
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + minutes * 60 * 1000);
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for (let i = 0; i < splits.length; i++)
	{
		let tokens = splits[i].trim().split("=");
		if (tokens[0] === "firstName") firstName = tokens[1];
		else if (tokens[0] === "lastName") lastName = tokens[1];
		else if (tokens[0] === "userId") userId = parseInt(tokens[1]);
	}

	if (userId < 0) window.location.href = "index.html";
	else document.getElementById("userName").innerHTML = `Logged in as ${firstName} ${lastName}`;
}

function doLogout()
{
	userId = 0; firstName = ""; lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}


function addContact()
{
	let first = document.getElementById("firstName").value;
	let last = document.getElementById("lastName").value;
	let email = document.getElementById("email").value;
	let phone = document.getElementById("phone").value;

	let tmp = { firstName: first, lastName: last, email: email, phone: phone, userId: userId };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if (this.readyState === 4 && this.status === 200)
		{
			document.getElementById("contactAddResult").innerHTML = "Contact added";
			searchContacts();
		}
	};
	xhr.send(jsonPayload);
}


function searchContacts()
{
	let search = document.getElementById("searchText").value;
	document.getElementById("contactResults").innerHTML = "";
	document.getElementById("contactSearchResult").innerHTML = "";

	let tmp = { search: search, userId: userId };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if (this.readyState === 4 && this.status === 200)
		{
			let jsonObject = JSON.parse(xhr.responseText);
			contacts = jsonObject.results || [];
			renderContacts();
			if (jsonObject.results?.length > 0) document.getElementById("contactSearchResult").innerHTML = "Contacts retrieved";
		}
	};
	xhr.send(jsonPayload);
}


function renderContacts()
{
	let html = "";
	contacts.forEach((c, i) =>
	{
		html += `
            <div class="contact-card">
                <input type="text" value="${c.firstName}" id="first-${i}" />
                <input type="text" value="${c.lastName}" id="last-${i}" />
                <input type="text" value="${c.email}" id="email-${i}" />
                <input type="text" value="${c.phone}" id="phone-${i}" />
                <div class="actions">
                    <button onclick="saveEdit(${i})">Save</button>
                    <button onclick="deleteContact(${i})">Delete</button>
                </div>
            </div>
            <hr>
        `;
	});
	document.getElementById("contactResults").innerHTML = html;
}


function saveEdit(index)
{
	let edited = {
		firstName: document.getElementById(`first-${index}`).value,
		lastName: document.getElementById(`last-${index}`).value,
		email: document.getElementById(`email-${index}`).value,
		phone: document.getElementById(`phone-${index}`).value,
		userId: userId
	};
	let jsonPayload = JSON.stringify(edited);
	let url = urlBase + '/EditContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if (this.readyState === 4 && this.status === 200)
		{
			let res = JSON.parse(xhr.responseText);
			if (res.error && res.error !== "") document.getElementById("contactEditResult").innerHTML = res.error;
			else {
				document.getElementById("contactEditResult").innerHTML = "Contact updated";
				contacts[index] = edited;
			}
		}
	};
	xhr.send(jsonPayload);
}


function deleteContact(index)
{
	let contact = contacts[index];
	let tmp = { email: contact.email, userId: userId };
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/DeleteContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if (this.readyState === 4 && this.status === 200)
		{
			let res = JSON.parse(xhr.responseText);
			if (res.error && res.error !== "") document.getElementById("contactDeleteResult").innerHTML = res.error;
			else
			{
				document.getElementById("contactDeleteResult").innerHTML = "Contact deleted";
				contacts.splice(index, 1);
				renderContacts();
			}
		}
	};
	xhr.send(jsonPayload);
}