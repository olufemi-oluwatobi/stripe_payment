const stripe = Stripe(
  "pk_test_51H63DSDC32qKcNvNV4AHH65chUEkhJSpQull5HypRjF8Q0NxvcO3zOcU8JTuE1SCAxHF2WfRVwIBPrZz9bqULE2N00AiewAo3v"
); // Your Publishable Key

const elements = stripe.elements();
let customerList;
// Create our card inputs
var style = {
  base: {
    color: "black",
  },
};
const populateDataList = (id, data, getValue) => {
  document.getElementById("input-card-list").value = "";
  var options = "";

  for (var i = 0; i < data.length; i++) {
    const value = getValue ? getValue(data[i]) : data[i];
    options += '<option value="' + value + '" />';
  }
  document.getElementById(id).innerHTML = options;
};
const card = elements.create("card", { style });
let customerCards;

const getCustomerList = () => {
  const customers = fetch("/customers")
    .then((data) => data.json())
    .then((data) => {
      customerList = data;
      const emails = data.map((data) => data.email);
      const names = data.map((data) => data.name);
      populateDataList("name", names);
      populateDataList("email", emails);
    });
  console.log(customers);
};

const displayCardList = (cards) => {
  if (cards.length) {
    document.getElementById("card-element").hidden = true;
    document.getElementById("input-card-list").hidden = false;

    populateDataList(
      "card-list",
      cards,
      (val) => `**** **** **** ${val.last4}`
    );
  } else {
    document.getElementById("card-element").hidden = false;
    document.getElementById("input-card-list").hidden = true;
  }
};

const getCustomerCards = (id) => {
  fetch(`/customers/${id}/cards`)
    .then((data) => data.json())
    .then((data) => {
      customerCards = data;
      displayCardList(data);
    });
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

const cardIdHandler = (value) => {
  if (customerCards) {
    const cardId = customerCards.filter((card) => {
      console.log(card, value.split(" ").pop(), value);

      // remove asterixs
      value = value.split(" ").pop();
      return card.last4 === value;
    })[0].id;
    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "cardId");
    hiddenInput.setAttribute("value", cardId);

    const form = document.querySelector("form");
    form.appendChild(hiddenInput);

    //form.submit();
  }
};

function formDataToJSON(FormElement) {
  var formData = new FormData(FormElement);
  var ConvertedJSON = {};
  for (const [key, value] of formData.entries()) {
    ConvertedJSON[key] = value;
  }

  return ConvertedJSON;
}

// Create token from card data
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const cardElementVisibility = document.getElementById("card-element").hidden;
  console.log(cardElementVisibility);
  if (!cardElementVisibility) {
    stripe.createToken(card).then((res) => {
      if (res.error) errorEl.textContent = res.error.message;
      else stripeTokenHandler(res.token);
    });
  } else {
    form.submit();
  }
});

const nameInput = document.getElementById("input-name");
const emailInput = document.getElementById("input-email");
const cardInput = document.getElementById("input-card-list");

emailInput.addEventListener("change", (e) => {
  const { value } = e.target;
  if (customerList) {
    console.log(value, "in heree");
    const customer = customerList.filter(
      (customer) => customer.email === value
    );
    console.log(customer);
    console.log(customer[0]);
    if (customer[0]) {
      document.getElementById("input-name").value = customer[0].name;
      console.log("down heree");
      getCustomerCards(customer[0].id);
    }
  }
});

nameInput.addEventListener("change", (e) => {
  try {
    const { value } = e.target;
    if (customerList) {
      console.log(value, "in heree");
      const customer = customerList.filter(
        (customer) => customer.name === value
      );
      console.log("customers", customer);
      console.log("customerseee ====>", customer[0]);
      if (customer[0]) {
        console.log("down herer");
        document.getElementById("input-email").value = customer[0].email;
        getCustomerCards(customer[0].id);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

cardInput.addEventListener("change", (e) => {
  const { value } = e.target;
  if (value) {
    cardIdHandler(value);
  }
});
