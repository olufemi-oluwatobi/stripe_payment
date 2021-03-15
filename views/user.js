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

const getUserType = () => {
  const user = localStorage.getItem("user_data");
  if (!user.length) return (window.location = "/");
  const userData = JSON.parse(user);
  const isAdmin = userData.role.toLowerCase() === "admin";
  if (isAdmin) {
    document.getElementById(
      "admin_gear"
    ).innerHTML += `<a href="/generate_code?email=${userData.email}&userType=admin" class="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">Settings</a>`;
  }
};
getUserType();

const logout = () => {
  localStorage.removeItem("token");
  window.location = "/";
};
