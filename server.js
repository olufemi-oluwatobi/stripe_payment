const express = require("express");
const env = require("dotenv");

let stripe = require("stripe");
// This is your real test secret API key.
const bodyParser = require("body-parser");
const path = require("path");
env.config(path.join(__dirname, ".env"));

console.log(process.env.SECRET_KEY);

stripe = stripe(process.env.SECRET_KEY);

const app = express();

// This will make our form data much more useful
app.use(bodyParser.urlencoded({ extended: true }));

// This will set express to render our views folder, then to render the files as normal html
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(express.static(path.join(__dirname, "./views")));

const findOrCreateCustomer = (customerData) =>
  stripe.customers
    .list({ email: customerData.email, limit: 1 })
    .then((customer) => {
      console.log(customer);
      if (customer.data[0]) return customer.data[0];
      return stripe.customers.create(customerData).then((data) => data);
    });
app.get("/customers", async (req, res) => {
  const customers = await stripe.customers.list();

  const data = customers.data.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
  }));
  res.status(200).json(data);
});

app.get("/customers/:id/cards", async (req, res) => {
  const cards = await stripe.customers.listSources(req.params.id, {
    object: "card",
    limit: 3,
  });
  res.status(200).json(cards.data);
});

app.post("/charge", (req, res) => {
  console.log("charg", req.body);
  try {
    findOrCreateCustomer({
      name: req.body.name,
      email: req.body.email,
      source: req.body.cardId || req.body.stripeToken,
    })
      .then((customer) => {
        console.log(customer);
        return stripe.charges.create({
          amount: req.body.amount,
          description: req.body.description,
          currency: "usd",
          customer: customer.id,
        });
      })
      .then(() => res.render("completed.html"))
      .catch((err) => console.log(err));
  } catch (err) {
    console.log(err);
    res.send(err.toString());
  }
});

// Future Code Goes Here

const port = process.env.PORT || 6503;
app.listen(port, () => console.log(`Server is running ${port}`));
