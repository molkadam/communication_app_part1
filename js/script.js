document.addEventListener("DOMContentLoaded", () => {
  // Check for logged-in user and redirect if necessary
  const loggedInUser = JSON.parse(localStorage.getItem("loggedin"));
  const namePattern = /^[a-zA-Z\s]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (
    !loggedInUser &&
    window.location.pathname != "/html/login.html" &&
    window.location.pathname != "/html/register.html"
  ) {
    window.location.href = "welcome.html";
  }
  const menuPlaceholder = document.getElementById("menu-placeholder");
  if (menuPlaceholder) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "menu.html", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        document.getElementById("menu-placeholder").innerHTML =
          xhr.responseText;
      }
    };
    xhr.send();
  }

  // Handle Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (user) => user.email === email && user.password === password
      );

      if (user) {
        localStorage.setItem("loggedin", JSON.stringify(user));
        window.location.href = "login_success.html";
      } else {
        document.getElementById("errorMessage").innerText =
          "Wrong Email or Password";
      }
    });
  }

  // Display logged-in user email on login success page
  const userEmailSpan = document.getElementById("userEmail");
  if (userEmailSpan) {
    userEmailSpan.innerText = loggedInUser ? loggedInUser.email : "";
  }

  // Handle Registration
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullname = document.getElementById("fullname").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const errorMessage = document.getElementById("errorMessage");

      errorMessage.innerText = ""; // Clear previous error message

      if (!fullname) {
        errorMessage.innerText = "Please enter your name";
        return;
      }

      if (!namePattern.test(fullname)) {
        errorMessage.innerText = "Name can only contain letters and spaces";
        return;
      }

      if (!email) {
        errorMessage.innerText = "Please enter an email address";
        return;
      }

      if (!emailPattern.test(email)) {
        errorMessage.innerText = "Invalid email address";
        return;
      }
      if (password.length < 8) {
        errorMessage.innerText = "Password minimum length should be 8";
        return;
      }
      if (!password) {
        errorMessage.innerText = "Please enter a password";
        return;
      }

      if (password !== confirmPassword) {
        errorMessage.innerText = "Passwords do not match";
        return;
      }
      const users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find((user) => user.email === email)) {
        document.getElementById("errorMessage").innerText =
          "User already exists";
        return;
      }

      const newUser = { id: Date.now(), fullname, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      window.location.href = "register_success.html";
    });
  }

  // Display User List
  const userTableBody = document.querySelector("#userTable tbody");
  if (userTableBody) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    checkUser = "";
    let disabled = "";
    users.forEach((user) => {
      const row = document.createElement("tr");
      if (loggedInUser.id === user.id) {
        disabled = "disabled";
      } else {
        disabled = "";
      }
      row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.fullname}</td>
          <td>${user.email}</td>
          <td>
            <a class="btn btn-primary" href="edit_user.html?id=${user.id}">Edit</a> | <!--<a class="btn btn-danger delete-user ${disabled}" href="delete_user.html?id=${user.id}">Delete</a>-->
            <a onclick="deleteUser(${user.id})" class="btn btn-danger delete-user ${disabled}" data-id=${user.id}"  >Delete</a>
            
          </td>
        `;
      userTableBody.appendChild(row);
    });
  }

  // Handle Edit User
  const editUserForm = document.getElementById("editUserForm");
  if (editUserForm) {
    const userId = new URLSearchParams(window.location.search).get("id");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((user) => user.id == userId);
    if (user) {
      document.getElementById("userId").value = user.id;
      document.getElementById("fullname").value = user.fullname;
      document.getElementById("email").value = user.email;
      if (loggedInUser.id == user.id) {
        document.getElementById("email").setAttribute("disabled", "disabled");
      }
      editUserForm.addEventListener("submit", (e) => {
        e.preventDefault();
        user.fullname = document.getElementById("fullname").value;
        user.email = document.getElementById("email").value;
        if (!user.fullname) {
          errorMessage.innerText = "Please enter your name";
          return;
        }

        if (!namePattern.test(user.fullname)) {
          errorMessage.innerText = "Name can only contain letters and spaces";
          return;
        }

        if (!user.email) {
          errorMessage.innerText = "Please enter an email address";
          return;
        }

        if (!emailPattern.test(user.email)) {
          errorMessage.innerText = "Invalid email address";
          return;
        }
        localStorage.setItem("users", JSON.stringify(users));
        window.location.href = "userlist.html";
      });
    }
  }

  // Handle Delete User
  const confirmDeleteButton = document.getElementById("confirmDelete");
  const cancelDeleteButton = document.getElementById("cancelDelete");
  if (confirmDeleteButton && cancelDeleteButton) {
    const userId = new URLSearchParams(window.location.search).get("id");
    confirmDeleteButton.addEventListener("click", () => {
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users = users.filter((user) => user.id != userId);
      localStorage.setItem("users", JSON.stringify(users));
      window.location.href = "userlist.html";
    });
    cancelDeleteButton.addEventListener("click", () => {
      window.location.href = "userlist.html";
    });
  }

  // Display Chat Messages and Handle Sending
  const messagesDiv = document.getElementById("messages");
  const messageInput = document.getElementById("messageInput");
  const sendMessageButton = document.getElementById("sendMessage");
  const activeUsers = document.getElementById("active-user");

  if (messagesDiv && messageInput && sendMessageButton) {
    activeUsers.innerHTML = `<strong>${loggedInUser.fullname}</strong>`;
    const chats = JSON.parse(localStorage.getItem("chats")) || [];
    const displayMessages = () => {
      messagesDiv.innerHTML = "";
      chats.forEach((chat) => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("text");
        if (loggedInUser.id == chat.uid) {
          messageDiv.classList.add("text-end");
        } else {
          messageDiv.classList.add("text-start");
        }

        messageDiv.innerHTML = `
            <div><p><span class="chat-user-name">${chat.user}:</span> <span class="user-chat">${chat.message}</span></p>
            <p class="datetime">${new Date(chat.timestamp).toLocaleString()}</p></div>
          `;
        messagesDiv.appendChild(messageDiv);
      });
    };

    displayMessages();
    sendMessageButton.addEventListener("click", () => {
      if (!messageInput.value.trim()) {
        alert("Message is required");
        return;
      }
      const newChat = {
        uid: loggedInUser.id,
        user: loggedInUser.fullname,
        message: messageInput.value,
        timestamp: Date.now(),
      };
      chats.push(newChat);
      localStorage.setItem("chats", JSON.stringify(chats));
      displayMessages();
      messageInput.value = "";
    });
  }

  // Display Document List
  const documentTableBody = document.querySelector("#documentTable tbody");
  if (documentTableBody) {
    const uploads = JSON.parse(localStorage.getItem("uploads")) || [];
    uploads.forEach((upload) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${upload.id}</td>
          <td>${upload.label}</td>
          <td>${upload.fileName}</td>
          <td>
            <a class="btn btn-primary" href="edit_document.html?id=${upload.id}">Edit</a> |
            <a onclick="deletefile(${upload.id})" class="btn btn-danger">Delete</a>
         
          </td>
        `;
      documentTableBody.appendChild(row);
    });
  }

  // Handle Upload Document

  const uploadForm = document.getElementById("uploadForm");

  if (uploadForm) {
    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const label = document.getElementById("label").value;
      const fileInput = document.getElementById("fileName");
      const fileName = fileInput.files[0] ? fileInput.files[0].name : "";
      if (!label.trim()) {
        document.getElementById("errorMessage").innerText =
          "Please enter file discription";
        return;
      } else if (!fileName.trim()) {
        document.getElementById("errorMessage").innerText =
          "Please select a file";
        return;
      }
      const uploads = JSON.parse(localStorage.getItem("uploads")) || [];
      const newUpload = { id: Date.now(), label, fileName };
      uploads.push(newUpload);
      localStorage.setItem("uploads", JSON.stringify(uploads));
      window.location.href = "documentlist.html";
    });
  }

  // Handle Edit Document
  const editDocumentForm = document.getElementById("editDocumentForm");
  if (editDocumentForm) {
    const documentId = new URLSearchParams(window.location.search).get("id");
    const uploads = JSON.parse(localStorage.getItem("uploads")) || [];
    const upload = uploads.find((upload) => upload.id == documentId);

    if (upload) {
      document.getElementById("documentId").value = upload.id;
      document.getElementById("label").value = upload.label;
      document.getElementById("fileName").value = upload.fileName;

      editDocumentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        upload.label = document.getElementById("label").value;
        upload.fileName = document.getElementById("fileName").value;
        if (!upload.label.trim()) {
          document.getElementById("errorMessage").innerText =
            "Please enter file discription";
          return;
        } else if (!upload.fileName.trim()) {
          document.getElementById("errorMessage").innerText =
            "Please select a file";
          return;
        }
        localStorage.setItem("uploads", JSON.stringify(uploads));
        window.location.href = "documentlist.html";
      });
    }
  }

  // Handle Delete Upload

  const confirmDeleteUploadButton = document.getElementById("confirmDelete");
  const cancelDeleteUploadButton = document.getElementById("cancelDelete");
  if (confirmDeleteUploadButton && cancelDeleteUploadButton) {
    const documentId = new URLSearchParams(window.location.search).get("id");
    confirmDeleteUploadButton.addEventListener("click", () => {
      let uploads = JSON.parse(localStorage.getItem("uploads")) || [];
      uploads = uploads.filter((upload) => upload.id != documentId);
      localStorage.setItem("uploads", JSON.stringify(uploads));
      window.location.href = "documentlist.html";
    });
    cancelDeleteUploadButton.addEventListener("click", () => {
      window.location.href = "documentlist.html";
    });
  }

  // Handle Logout
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("loggedin");
      window.location.href = "welcome.html";
    });
  }
});

function deleteUser(userid) {
  const userId = userid;
  let confirmed = confirm("Are you sure?");
  if (confirmed == true) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.filter((user) => user.id != userId);
    localStorage.setItem("users", JSON.stringify(users));
    window.location.href = "userlist.html";
  } else {
    window.location.href = "userlist.html";
  }
}

function deletefile(fileid) {
  const documentId = fileid;
  let confirmed = confirm("Are you sure");
  if (confirmed == true) {
    let uploads = JSON.parse(localStorage.getItem("uploads")) || [];
    uploads = uploads.filter((upload) => upload.id != documentId);
    localStorage.setItem("uploads", JSON.stringify(uploads));
    window.location.href = "documentlist.html";
  } else {
    window.location.href = "documentlist.html";
  }
}
