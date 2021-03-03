const express = require("express");
let stripe = require("stripe");
// This is your real test secret API key.
const bodyParser = require("body-parser");
const path = require("path");
stripe = stripe(
  "sk_test_51H63DSDC32qKcNvNU8aby9QXGKbGI8um9bjWidf5mnJUb0qn61TGh7GqjpbZyAUWBegc0JeTWZXHs07sEuB2gwEj005wUlVwGi"
);

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

app.post("/charge", (req, res) => {
  try {
    findOrCreateCustomer({
      name: req.body.name,
      email: req.body.email,
      source: req.body.stripeToken,
    })
      .then((customer) => {
        console.log(customer);
        return stripe.charges.create({
          amount: req.body.amount * 100,
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
