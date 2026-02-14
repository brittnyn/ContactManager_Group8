const urlBase = 'http://adamdisanti.xyz/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let contacts = [];
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
    let firstName = document.getElementById("regFirst").value;
    let lastName = document.getElementById("regLast").value;
	

    let username = document.getElementById("regUser").value;
    let password = document.getElementById("regPassword").value;
	let repeat = document.getElementById("regRepeatPass").value;

	let error = validSignUpForm(firstName, lastName, username, password, repeat);

	if (error) 
	{
    	document.getElementById("registerResult").innerText = error;
    	return;
	}
 
    var hash = md5(password);

    let tmp = 
	{
        firstName: firstName,
        lastName: lastName,
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
		searchContacts();
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
			searchContacts();
		}
	};
	xhr.send(jsonPayload);
}


function searchContacts()
{
	let search = document.getElementById("searchText").value;
	document.getElementById("contactResults").innerHTML = "";

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
                <input type="text" value="${c.FirstName}" id="first-${i}" />
                <input type="text" value="${c.LastName}" id="last-${i}" />
                <input type="text" value="${c.Email}" id="email-${i}" />
                <input type="text" value="${c.Phone}" id="phone-${i}" />
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
	let contact = contacts[index];
	let edited = {
		id: contact.id,
		firstName: document.getElementById(`first-${index}`).value,
		lastName: document.getElementById(`last-${index}`).value,
		email: document.getElementById(`email-${index}`).value,
		phone: document.getElementById(`phone-${index}`).value,
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
	let tmp = { email: contact.Email, userId: userId };
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




