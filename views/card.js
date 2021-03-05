const stripe = Stripe(
  "pk_test_51H63DSDC32qKcNvNuaPLNyIBKWQDdmeQI68nJWwpCxxKRUrONlweEFegRE3KSTUXLK9NwvpG4TvKZbJEKC6PvSAs001l7EtDsP"
); // Your Publishable Key

const elements = stripe.elements();
let customerList;
// Create our card inputs
var style = {
  base: {
    color: "#fff",
  },
};
const populateDataList = (id, data) => {
  var options = "";

  for (var i = 0; i < data.length; i++) {
    options += '<option value="' + data[i] + '" />';
  }
  document.getElementById(id).innerHTML = options;
};
const card = elements.create("card", { style });
const getCustomerList = () => {
  const customers = fetch("/customers")
    .then((data) => data.json())
    .then((data) => {
      customerList = data;
      const emails = data.map((data) => data.email).filter((data) => data);
      const names = data.map((data) => data.name).filter((data) => data);
      populateDataList("name", names);
      populateDataList("email", emails);
    });
  console.log(customers);
};
getCustomerList();
card.mount("#card-element");

const form = document.querySelector("form");
const errorEl = document.querySelector("#card-errors");

// Give our token to our form
const stripeTokenHandler = (token) => {
  const hiddenInput = document.createElement("input");
  hiddenInput.setAttribute("type", "hidden");
  hiddenInput.setAttribute("name", "stripeToken");
  hiddenInput.setAttribute("value", token.id);
  form.appendChild(hiddenInput);

  form.submit();
};

// Create token from card data
form.addEventListener("submit", (e) => {
  e.preventDefault();

  stripe.createToken(card).then((res) => {
    if (res.error) errorEl.textContent = res.error.message;
    else stripeTokenHandler(res.token);
  });
});

const nameInput = document.getElementById("input-name");
const emailInput = document.getElementById("input-email");

emailInput.addEventListener("change", (e) => {
  const { value } = e.target;
  if (customerList) {
    console.log(value, "in heree");
    const customer = customerList.filter(
      (customer) => customer.email === value
    );

    if (customer[0])
      document.getElementById("input-name").value = customer[0].name;
  }
});

nameInput.addEventListener("change", (e) => {
  const { value } = e.target;
  if (customerList) {
    console.log(value, "in heree");
    const customer = customerList.filter((customer) => customer.name === value);
    console.log(customer);
    if (customer[0])
      document.getElementById("input-email").value = customer[0].email;
  }
});
