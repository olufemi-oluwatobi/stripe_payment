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
    window.location = "/payment";
  }
};

removeSearchQuery();

const getUserType = () => {
  const user = localStorage.getItem("user_data");
  if (!user.length) return (window.location = "/");
  const userData = JSON.parse(user);
  const isAdmin = userData.role.toLowerCase() === "admin";
  if (isAdmin) {
    document.getElementById("admin_gear").innerHTML +=
      '<a href="/admin"  class="py-4 flex cursor-pointer items-center"><img  class="w-8" src="https://img.icons8.com/carbon-copy/100/000000/settings.png"/><span>Settings</span></a>';
  }
};
getUserType();

const logout = () => {
  localStorage.removeItem("token");
  window.location = "/";
};
