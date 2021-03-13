const addToUserList = (user) => {
  console.log(user.role.toLowerCase(), user.role.toLowerCase() === "user");
  document.getElementById(
    "user_table"
  ).innerHTML += `<tr class="border-b hover:bg-orange-100">
        <td class="p-3 px-5"><input name="username" data-id=${
          user.id
        } type="text" value="${user.username}" class="bg-transparent"></td>
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
                class="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline">Delete</button>
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
  const username = button.parentNode.parentNode.querySelector("input").value;
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

const queryData = new URLSearchParams(window.location.search);
let user = queryData.getAll("user");

if (user.length) {
  user = JSON.parse(user);
  addToUserList(user);
  if (window.location.search) {
    window.location = "/admin";
  }
}
const logout = () => {
  localStorage.removeItem("token");
  window.location = "/";
};
