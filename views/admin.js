const queryData = new URLSearchParams(window.location.search);
const token = queryData.getAll("token");
let user = queryData.getAll("user");

if (user.length) {
  localStorage.setItem("user_data", user);
}

if (token.length) {
  localStorage.setItem("token", token);
}

const removeSearchQuery = () => {
  if (window.location.search) {
    const path = window.location.pathname;
    window.location = path;
  }
};

removeSearchQuery();
function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const verifyToken = (token, callback) => {
  try {
    if (!token) {
      window.location = "/";
      return;
    }
    const tokenObject = parseJwt(token);
    const { exp, role, type, email } = tokenObject;
    if (Date.now() >= exp * 1000) {
      return (window.location = "/");
    } else {
      if (role !== "admin" && type !== "2fa") {
        window.location = `/generate_code?email=${email}&userType=admin`;
        return;
      }
      return;
    }
  } catch (error) {
    console.log(error);
    return callback("error", null);
  }
};

verifyToken(localStorage.getItem("token"), (error, data) => {
  if (error) return (window.location = "/");
  window.location = "";
});
const addToUserList = (user) => {
  console.log(user);
  console.log(user.role.toLowerCase(), user.role.toLowerCase() === "user");
  document.getElementById(
    "user_table"
  ).innerHTML += `<tr class="border-b hover:bg-orange-100">
        <td class="p-3 px-5"><input required id="email" name="email" data-id=${
          user.id
        } type="email" value="${user.email}" class="bg-transparent"></td>
        <td class="p-3 px-5"><input id="username" name="username" data-id=${
          user.id
        } type="text" value="${user.username}" class="bg-transparent"></td>
        <td class="p-3 px-5"><input name="username" data-id=${
          user.id
        } type="text" value="${user.status}" class="bg-transparent"></td>
        <td class="p-3 px-5">
            <select name="role" value="${user.role.toLowerCase()}" class="bg-transparent">
                <option ${
                  user.role.toLowerCase() === "user" ? "selected" : "not"
                } value="user">user</option>
                <option ${
                  user.role.toLowerCase() === "admin" ? "selected" : "not"
                } value="admin">admin</option>
            </select>
        </td>
        <td class="p-3 px-5 flex justify-end"><button onClick="onEdit(this)" type="button"
                class="mr-3  text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">Save</button><button
                type="button"
                onClick="onDelete(this)"
                class="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">${
                  user.status === "active" ? "deactivate" : "activate"
                }</button>
        </td>
        </tr>
        `;
};

const onEdit = (button) => {
  const table = document.getElementById("user_table");
  const id = button.parentNode.parentNode
    .querySelector("input")
    .getAttribute("data-id");
  console.log(id);
  const username = button.parentNode.parentNode.querySelector("#username")
    .value;
  const email = button.parentNode.parentNode.querySelector("#email").value;
  const role = button.parentNode.parentNode.querySelector("select").value;
  const token = localStorage.getItem("token");
  console.log("token", token);

  let status;
  console.log(username, role);

  return fetch(`/users/${id}`, {
    method: "PUT",
    headers: new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ username, role, email }),
  })
    .then((res) => {
      status = res.status;
      return res.json();
    })
    .then((data) => {
      if (status === 401) window.location = "/";
      else {
        if (status === 204) {
          alert("updated");
        } else if (status === 400) {
          alert(data.error);
        }
      }
    })
    .finally(() => (window.location = "/admin"));
  console.log(username, role);
};

const onDelete = (button) => {
  const table = document.getElementById("user_table");
  const id = button.parentNode.parentNode
    .querySelector("input")
    .getAttribute("data-id");
  console.log(id);
  const username = button.parentNode.parentNode.querySelector("input").value;
  const role = button.parentNode.parentNode.querySelector("select").value;
  const token = localStorage.getItem("token");
  console.log("token", token);

  let status;
  console.log(username, role);

  return fetch(`/users/${id}`, {
    method: "DELETE",
    headers: new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ username, role }),
  })
    .then((res) => {
      status = res.status;
      return res.json();
    })
    .then((data) => {
      if (status === 401) window.location = "/";
      else {
        if (status === 204) {
          alert("DELETED");
          window.location = "/admin";
        } else if (status === 400) {
          alert("delete failed");
        }
      }
    })
    .finally(() => (window.location = "/admin"));
  console.log(username, role);
};

const getUserList = () => {
  const token = localStorage.getItem("token");
  console.log("token", token);
  fetch("/users", {
    headers: new Headers({
      Authorization: token,
      "Content-Type": "application/json",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      data.users.forEach((user) => {
        addToUserList(user);
      });
    });
};

getUserList();

const logout = () => {
  localStorage.removeItem("token");
  window.location = "/";
};

const toggleTabView = (element) => {
  const { id: elementId } = element;
  const inactiveTabItem = {
    action_tab: "list_tab_item",
    list_tab: "action_tab_item",
  };
  console.log(inactiveTabItem[elementId], elementId);
  console.log(document.getElementById(`${elementId}_item`).hidden);
  document.getElementById(`${elementId}_item`).hidden = false;
  document.getElementById(inactiveTabItem[elementId]).hidden = true;
};

const changetab = (element) => {
  const activeTabClass = "py-2 px-6 bg-white rounded-t-lg";
  const inactiveTab = {
    action_tab: "list_tab",
    list_tab: "action_tab",
  };
  const inactiveTabClass =
    "py-2 px-6 bg-white rounded-t-lg text-gray-500 bg-gray-200";
  const elementId = element.id;
  element.className = activeTabClass;
  document.getElementById(inactiveTab[elementId]).className = inactiveTabClass;
  toggleTabView(element);
};
