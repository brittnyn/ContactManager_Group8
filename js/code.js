const urlBase = 'http://adamdisanti.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let contacts = [];
// UI state maps allow multiple rows to stay expanded/edited independently.
let expandedContactMap = {};
let editModeMap = {};
// Draft buffer keyed by row index so one save doesn't wipe another row's in-progress edits.
let contactDraftMap = {};
// Tracks which row is pending deletion in the confirmation dialog.
let pendingDeleteIndex = null;
const ids = []

// Switch between Login and Register Boxes
var log = document.querySelector('.loginBox');
var reg = document.querySelector('.registerBox');
var but = document.getElementById('switchButton');

function switchToLogin()
{
	log.style.transform = "translateX(0)";
	reg.style.transform = "translateX(20%)";
	but.style.left = "0px";

	document.getElementById("registerResult").textContent = "";
}

function switchToRegister()
{
	log.style.transform = "translateX(-125%)";
	reg.style.transform = "translateX(-145%)";
	but.style.left = "150px";

	document.getElementById("loginResult").textContent = "";
	document.getElementById("loginName").value="";
	document.getElementById("loginPassword").value="";
}

// Password Toggle in Login Page
function toggleLoginPassword()
{
	var passwordField = document.getElementById("loginPassword");
	var eyeIcon = document.getElementById("eye");
	var eyeSlashIcon = document.getElementById("eyeSlash");

	if(passwordField.type === "password")
	{
		passwordField.type = "text";
		eyeIcon.style.opacity = 0;
		eyeSlashIcon.style.opacity = 1;
	} 
	else 
	{
		passwordField.type = "password";
		eyeIcon.style.opacity = 1;
		eyeSlashIcon.style.opacity = 0;
	}
}

// Password Toggle in Register Page
function toggleRegPassword(){
	var passwordField = document.getElementById("regPassword");
	var eyeIcon = document.getElementById("eye-2");
	var eyeSlashIcon = document.getElementById("eyeSlash-2");

	if(passwordField.type === "password")
	{
		passwordField.type = "text";
		eyeIcon.style.opacity = 0;
		eyeSlashIcon.style.opacity = 1;
	}
	else
	{
		passwordField.type = "password";
		eyeIcon.style.opacity = 1;
		eyeSlashIcon.style.opacity = 0;
	}
}

function toggleRegRepeat(){
	var passwordField = document.getElementById("regRepeatPass");
	var eyeIcon = document.getElementById("eye-3");
	var eyeSlashIcon = document.getElementById("eyeSlash-3");

	if(passwordField.type === "password")
	{
		passwordField.type = "text";
		eyeIcon.style.opacity = 0;
		eyeSlashIcon.style.opacity = 1;
	}
	else
	{
		passwordField.type = "password";
		eyeIcon.style.opacity = 1;
		eyeSlashIcon.style.opacity = 0;
	}
}

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	
	var hash = md5( password );
	
   	let error = validLoginForm(login, password);
	if (error) 
	{
    	document.getElementById("loginResult").innerText = error;
    	return;
	}

	var tmp = 
	{
		login:login,
		password:hash
	};

	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

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
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "* User/Password Combination Incorrect.";
					return;
				}
				
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;
				saveCookie();

				document.getElementById("loginResult").style.color = "#51cf66";
				document.getElementById("loginResult").style.backgroundColor = "rgba(81, 207, 102, 0.1)";
				document.getElementById("loginResult").innerText = "Logging in...";
                
				setTimeout(() => {
  						window.location.href = "contact.html";
				}, 1000);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doRegister() 
{
	// Use distinct local names so we don't shadow global firstName/lastName.
	let regFirstName = document.getElementById("regFirst").value;
	let regLastName = document.getElementById("regLast").value;

    let username = document.getElementById("regUser").value;
    let password = document.getElementById("regPassword").value;
	let repeat = document.getElementById("regRepeatPass").value;

	//let error = validSignUpForm(firstName, lastName, username, password, repeat);
	let error = validSignUpForm(regFirstName, regLastName, username, password, repeat);


	if (error) 
	{
    	document.getElementById("registerResult").innerText = error;
    	return;
	}
 
    var hash = md5(password);

    let tmp = 
	{
		firstName: regFirstName,
		lastName: regLastName,
        login: username,
        password: hash
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;
	
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () 
		{

            if (this.readyState != 4) 
			{
                return;
            }

            if (this.status == 409) 
			{
                document.getElementById("registerResult").innerHTML = "Username Already Exists";
                return;
            }

            if (this.status == 200) 
			{	
				boxDiv.style.minHeight = "720px";

                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;
				// Persist into global state so saveCookie() includes the welcome name.
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;
				
				document.getElementById("registerResult").style.color = "#51cf66";
				document.getElementById("registerResult").style.backgroundColor = "rgba(81, 207, 102, 0.1)";
				document.getElementById("registerResult").innerText = "Account created! Logging in...";
                saveCookie();
				setTimeout(() => {
  						window.location.href = "contact.html";
				}, 1000);
            }
        };

        xhr.send(jsonPayload);
    } catch (err) 
	{
        document.getElementById("registerResult").innerHTML = err.message;
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
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
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = firstName + " " + lastName;
		// If we're on the contacts page, load this user's contacts immediately.
		if (document.getElementById("contactResults"))
		{
			searchContacts();
		}
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

const USERNAME_REGEX = /^(?=.*[a-zA-Z])[a-zA-Z0-9-_]{3,18}$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}$/;
const PHONE_REGEX = /^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
const EMAIL_REGEX = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

// Individual pattern checks
const PATTERNS = {
    letter: /[a-zA-Z]/,
    number: /\d/,
    symbol: /[!@#$%^&*]/,
    underscore: /_/,
    hyphen: /-/
};

const boxDiv = document.getElementById("box");
const regUser = document.getElementById("regUser");
const regPassword = document.getElementById("regPassword");
const explanationUser = document.getElementById("explanationUser");
const explanationPassword = document.getElementById("explanationPassword");

// Username requirement elements
const userLett = document.getElementById("userLett");
const userLen = document.getElementById("userLen");
const userNum = document.getElementById("userNum");
const userUnd = document.getElementById("userUnd");
const userHyp = document.getElementById("userHyp");

// Password requirement elements
const passLett = document.getElementById("passLett");
const passNum = document.getElementById("passNum");
const passSymb = document.getElementById("passSymb");
const passLen = document.getElementById("passLen");

const ORIGINAL_HEIGHT = "720px";
const EXPAND_HEIGHT = "860px";

// Guard register-only UI bindings so contact page script execution doesn't fail.
if (regUser && regPassword && explanationUser && explanationPassword && boxDiv)
{
regUser.onfocus = function() 
{
	explanationUser.style.display = "block";
	boxDiv.style.minHeight = EXPAND_HEIGHT;
	document.getElementById("registerResult").textContent = "";
};

regUser.onblur = function() 
{
	explanationUser.style.display = "none";
	if (!regPassword.matches(':focus')) {
		boxDiv.style.minHeight = ORIGINAL_HEIGHT;
	}
};

regPassword.onfocus = function() 
{
	explanationPassword.style.display = "block";
	boxDiv.style.minHeight = EXPAND_HEIGHT;
	document.getElementById("registerResult").textContent = "";
};

regPassword.onblur = function() 
{
	explanationPassword.style.display = "none";
	if (!regUser.matches(':focus')) {
		boxDiv.style.minHeight = ORIGINAL_HEIGHT;
	}
};

// Immediate username validation
regUser.oninput = function() 
{
	const value = regUser.value;
    
    if (PATTERNS.letter.test(value)) 
	{
        userLett.classList.remove("invalid");
        userLett.classList.add("valid");
    } 
	else 
	{
        userLett.classList.remove("valid");
        userLett.classList.add("invalid");
    }
    
    if (value.length >= 3 && value.length <= 18) 
	{
        userLen.classList.remove("invalid");
        userLen.classList.add("valid");
    } 
	else 
	{
        userLen.classList.remove("valid");
        userLen.classList.add("invalid");
    }
    
    if (PATTERNS.number.test(value)) 
	{
        userNum.classList.remove("opt");
        userNum.classList.add("valid");
    } 
	else 
	{
        userNum.classList.remove("valid");
        userNum.classList.add("opt");
    }
    
    if (PATTERNS.underscore.test(value)) 
	{
        userUnd.classList.remove("opt");
        userUnd.classList.add("valid");
    } 
	else 
	{
        userUnd.classList.remove("valid");
        userUnd.classList.add("opt");
    }
    
    if (PATTERNS.hyphen.test(value)) 
	{
        userHyp.classList.remove("opt");
        userHyp.classList.add("valid");
    } 
	else 
	{
        userHyp.classList.remove("valid");
        userHyp.classList.add("opt");
    }
};

// Immediate password validation
regPassword.oninput = function() 
{
    const value = regPassword.value;
    
    if (PATTERNS.letter.test(value)) 
	{
        passLett.classList.remove("invalid");
        passLett.classList.add("valid");
    } 
	else 
	{
        passLett.classList.remove("valid");
        passLett.classList.add("invalid");
    }
    
    if (PATTERNS.number.test(value))
	{
        passNum.classList.remove("invalid");
        passNum.classList.add("valid");
    } 
	else 
	{
        passNum.classList.remove("valid");
        passNum.classList.add("invalid");
    }
    
    if (PATTERNS.symbol.test(value)) 
	{
        passSymb.classList.remove("invalid");
        passSymb.classList.add("valid");
    } 
	else
	{
        passSymb.classList.remove("valid");
        passSymb.classList.add("invalid");
    }
    
    if (value.length >= 8 && value.length <= 32) {
        passLen.classList.remove("invalid");
        passLen.classList.add("valid");
    } else {
        passLen.classList.remove("valid");
        passLen.classList.add("invalid");
    }
}
}

function validLoginForm(username, password) 
{

    if (!username.trim()) 
	{
        return "* Username is required.";
    }

    if (!USERNAME_REGEX.test(username)) 
	{
        return "* Username must be 3–18 characters and contain at least one letter.";
    }

    if (!password) 
		{
        return "* Password is required.";
    }

    return  null;
}


function validSignUpForm(firstName, lastName, username, password, repeat) 
{

    if (!firstName.trim()) 
	{
        return "* First name is required.";
    }

    if (!lastName.trim()) 
	{
        return "* Last name is required.";
    }

    if (!username.trim()) 
	{
        return "* Username is required.";
    }

    if (!USERNAME_REGEX.test(username)) 
	{
        return "* Username must be 3–18 characters and contain at least one letter.";
    }

    if (!password) 
	{
        return "* Password is required.";
    }

    if (!PASSWORD_REGEX.test(password)) 
	{
        return "* Password must be 8–32 characters and include a letter, number, and symbol.";
    }

	if (password != repeat) 
	{
        return "* Passwords do not match.";
    }

    return null;
}


function addContact()
{
	let first = document.getElementById("firstName").value;
	let last = document.getElementById("lastName").value;
	let email = document.getElementById("email").value;
	let phone = document.getElementById("phone").value;

	let error = validContactInfo(first, last, phone, email);
	if (error) 
	{
    	document.getElementById("contactAddResult").innerText = error;
    	return;
	}
 
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
			// Clear inputs after a successful create.
			document.getElementById("firstName").value = "";
			document.getElementById("lastName").value = "";
			document.getElementById("email").value = "";
			document.getElementById("phone").value = "";
			// Refresh list so the new contact appears in "Your Contacts".
			searchContacts();
		}
	};
	xhr.send(jsonPayload);
}

// Normalize mixed backend key styles (firstName vs FirstName, etc.)
// so rendering logic can use a single object shape.
function normalizeContact(c)
{
	return {
		id: c.id ?? c.ID ?? null,
		firstName: c.firstName ?? c.FirstName ?? "",
		lastName: c.lastName ?? c.LastName ?? "",
		email: c.email ?? c.Email ?? "",
		phone: c.phone ?? c.Phone ?? ""
	};
}


function searchContacts()
{
	let search = document.getElementById("searchText").value;
	document.getElementById("contactResults").innerHTML = "";
	document.getElementById("contactEditResult").innerHTML = "";
	document.getElementById("contactDeleteResult").innerHTML = "";

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
			// Backend returns an error object when no rows are found.
			if (jsonObject.error && jsonObject.error !== "")
			{
				contacts = [];
				renderContacts();
				return;
			}

			// Keep a local normalized array used by render/edit/delete.
			contacts = (jsonObject.results || []).map(normalizeContact);
			// Reset open/edit state each time a fresh search result is rendered.
			expandedContactMap = {};
			editModeMap = {};
			contactDraftMap = {};
			renderContacts();
			if (contacts.length > 0)
			{
				document.getElementById("contactAddResult").innerHTML = "Contacts retrieved";
			}
		}
	};
	xhr.send(jsonPayload);
}

// Escape untrusted text before inserting it in HTML templates.
function escapeHtml(value)
{
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

// Expand/collapse one row without affecting other expanded rows.
function toggleContact(index)
{
	if (expandedContactMap[index])
	{
		// Collapsing a row exits edit mode and clears unsaved draft for that row only.
		delete expandedContactMap[index];
		delete editModeMap[index];
		delete contactDraftMap[index];
	}
	else
	{
		expandedContactMap[index] = true;
	}
	renderContacts();
}

// Turn editing controls on/off per row (multiple rows can be edited if desired).
function toggleEditMode(index)
{
	expandedContactMap[index] = true;
	if (editModeMap[index])
	{
		// Cancel editing for this row only.
		delete editModeMap[index];
		delete contactDraftMap[index];
	}
	else
	{
		// Start edit mode with a copy of persisted values.
		editModeMap[index] = true;
		contactDraftMap[index] = { ...contacts[index] };
	}
	renderContacts();
}

// Keep one row's draft up to date as the user types.
function updateContactDraft(index, field, value)
{
	if (!contactDraftMap[index])
	{
		contactDraftMap[index] = { ...contacts[index] };
	}
	contactDraftMap[index][field] = value;
}


function renderContacts()
{
	// Render a friendly empty state when search returns no contacts.
	if (!contacts.length)
	{
		document.getElementById("contactResults").innerHTML = '<p class="emptyState">No contacts found.</p>';
		return;
	}

	let html = "";
	contacts.forEach((c, i) =>
	{
		const isExpanded = !!expandedContactMap[i];
		const isEditing = !!editModeMap[i];
		// If the row is in edit mode, render from its draft to preserve unsaved typing.
		const displayContact = isEditing && contactDraftMap[i] ? contactDraftMap[i] : c;
		// Keep the summary/header name tied to persisted data until Save is clicked.
		const fullName = `${c.firstName} ${c.lastName}`.trim();
		const safeName = escapeHtml(fullName || "Unnamed Contact");
		const safeFirstName = escapeHtml(displayContact.firstName);
		const safeLastName = escapeHtml(displayContact.lastName);
		const safeEmail = escapeHtml(displayContact.email);
		const safePhone = escapeHtml(displayContact.phone);

		html += `
			<div class="contact-card ${isExpanded ? 'expanded' : ''}">
				<button type="button" class="contact-summary" onclick="toggleContact(${i})" aria-expanded="${isExpanded}">
					<span class="contact-summary-name">${safeName}</span>
					<span class="contact-summary-icon">${isExpanded ? '−' : '+'}</span>
				</button>

				<div class="contact-details ${isExpanded ? 'show' : ''}">
					<input type="text" value="${safeFirstName}" id="first-${i}" placeholder="First Name" ${isEditing ? '' : 'readonly'} oninput="updateContactDraft(${i}, 'firstName', this.value)" />
					<input type="text" value="${safeLastName}" id="last-${i}" placeholder="Last Name" ${isEditing ? '' : 'readonly'} oninput="updateContactDraft(${i}, 'lastName', this.value)" />
					<input type="email" value="${safeEmail}" id="email-${i}" placeholder="Email Address" ${isEditing ? '' : 'readonly'} oninput="updateContactDraft(${i}, 'email', this.value)" />
					<input type="tel" value="${safePhone}" id="phone-${i}" placeholder="Phone Number" ${isEditing ? '' : 'readonly'} oninput="updateContactDraft(${i}, 'phone', this.value)" />

					<div class="actionsTop">
						<button type="button" class="editBtn" onclick="toggleEditMode(${i})">${isEditing ? 'Cancel' : 'Edit'}</button>
					</div>

					<div class="actions ${isEditing ? 'show' : ''}">
						<button type="button" onclick="saveEdit(${i})">Save</button>
						<button type="button" onclick="requestDeleteContact(${i})">Delete</button>
					</div>
				</div>
            </div>
        `;
	});
	document.getElementById("contactResults").innerHTML = html;
}

// Open the modal and remember which contact row should be deleted if confirmed.
function requestDeleteContact(index)
{
	pendingDeleteIndex = index;
	const modal = document.getElementById("deleteConfirmModal");
	if (modal)
	{
		modal.classList.add("show");
		modal.setAttribute("aria-hidden", "false");
	}
}

// Close modal without deleting anything.
function closeDeleteConfirm()
{
	pendingDeleteIndex = null;
	const modal = document.getElementById("deleteConfirmModal");
	if (modal)
	{
		modal.classList.remove("show");
		modal.setAttribute("aria-hidden", "true");
	}
}

// Delete only after explicit user confirmation.
function confirmDeleteContact()
{
	if (pendingDeleteIndex === null)
	{
		closeDeleteConfirm();
		return;
	}

	const indexToDelete = pendingDeleteIndex;
	closeDeleteConfirm();
	deleteContact(indexToDelete);
}


function saveEdit(index)
{
	// Read from draft first, then fallback to DOM values.
	const draft = contactDraftMap[index] || {
		firstName: document.getElementById(`first-${index}`).value,
		lastName: document.getElementById(`last-${index}`).value,
		email: document.getElementById(`email-${index}`).value,
		phone: document.getElementById(`phone-${index}`).value
	};

	let edited = {
		id: contacts[index].id,
		firstName: draft.firstName,
		lastName: draft.lastName,
		email: draft.email,
		phone: draft.phone,
		userId: userId
	};

	let error = validContactInfo(edited.firstName, edited.lastName, edited.phone, edited.email);
	if (error) 
	{
    	document.getElementById("contactEditResult").innerText = error;
    	return;
	}
	let jsonPayload = JSON.stringify(edited);
	let url = urlBase + '/EditContact.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function()
	{
		if (this.readyState !== 4)
		{
			return;
		}

		if (this.status !== 200)
		{
			document.getElementById("contactEditResult").innerHTML = "Update request failed. Please try again.";
			return;
		}

		if (this.status === 200)
		{
			let res = JSON.parse(xhr.responseText);
			if (res.error && res.error !== "") document.getElementById("contactEditResult").innerHTML = res.error;
			else {
				document.getElementById("contactEditResult").innerHTML = "Contact updated";
				contacts[index] = edited;
				// Exit edit mode only for the saved row; preserve all other drafts/edits.
				delete editModeMap[index];
				delete contactDraftMap[index];
				renderContacts();
			}
		}
	};
	xhr.send(jsonPayload);
}


function deleteContact(index)
{
	// Safety: ignore stale indices (e.g., list changed before confirm click).
	if (index < 0 || index >= contacts.length)
	{
		document.getElementById("contactDeleteResult").innerHTML = "Contact no longer available.";
		return;
	}

	let contact = contacts[index];
	// Delete by unique contact id (scoped by userId on the backend).
	let tmp = { id: contact.id, userId: userId };
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
				// Rebuild state maps after removing an item to avoid index drift.
				expandedContactMap = {};
				editModeMap = {};
				contactDraftMap = {};
				renderContacts();
			}
		}
	};
	xhr.send(jsonPayload);

}
function validContactInfo(firstName, lastName, phone, email)
{
	if (!firstName.trim()) 
	{
        return "* First name is required.";
    }

    if (!lastName.trim()) 
	{
        return "* Last name is required.";
    }

    if (!phone.trim()) 
	{
        return "* Phone number is required.";
    }

    if (!PHONE_REGEX.test(phone)) 
	{
        return "* Phone number must be in standard 10 digit format.";
    }

    if (!email.trim()) 
	{
        return "* Email is required.";
    }

    if (!EMAIL_REGEX.test(email)) 
	{
        return "*Email must follow standard format.";
    }

    return null;

}




