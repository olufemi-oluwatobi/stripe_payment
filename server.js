const express = require("express");
const env = require("dotenv");
const puppeteer = require("puppeteer");
const fs = require("fs");

let stripe = require("stripe");
let pdf = require("html-pdf");
const axios = require("axios");
// This is your real test secret API key.
const bodyParser = require("body-parser");
const { SECRET_KEY } = require("./config/index");
const path = require("path");

const instance = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 1000,
  headers: { "X-Custom-Header": "foobar" },
});

// const MONGO_URL =
//   "mongodb+srv://kws:Password123@cluster0.ns83g.mongodb.net/kws_server?retryWrites=true&w=majority";
// mongoose
//   .connect(MONGO_URL, { useNewUrlParser: true })
//   .then(() => console.log("connected to mongo"))
//   .catch((error) => console.log(error));

env.config(path.join(__dirname, ".env"));

const convertFileToDataUrl = (url) => {
  var mime = "application/pdf";
  var encoding = "base64";
  var data = fs.readFileSync(url).toString(encoding);
  var uri = "data:" + mime + ";" + encoding + "," + data;
  return uri;
};
console.log(process.env.SECRET_KEY);

stripe = stripe(process.env.SECRET_KEY);

const app = express();

// This will make our form data much more useful
app.use(bodyParser.urlencoded({ extended: true }));

// This will set express to render our views folder, then to render the files as normal html
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);
// app.use(
//   session({
//     secret: SECRET_KEY,
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({ mongoUrl: MONGO_URL }),
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());
app.use(express.static(path.join(__dirname, "./views")));

async function printPDF(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4" });

  await browser.close();
  return pdf;
}

const findOrCreateCustomer = (customerData) =>
  stripe.customers
    .list({ email: customerData.email, limit: 1 })
    .then((customer) => {
      console.log(customer);
      if (customer.data[0]) return customer.data[0];
      return stripe.customers.create(customerData).then((data) => data);
    });

app.get("/", (req, res) => {
  res.render("index", { error: "" });
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

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const { status, data } = await axios({
      url: "http://localhost:4030/login",
      method: "POST",
      data: { username, password },
    });
    if (status === 200) {
      return res.redirect("/payment");
    }
    return res.render("index", { error: "Invalid Credentials" });
  } catch (error) {
    console.log(error);
    return res.render("index", { error: "invalid credential" });
  }

  // passport.authenticate("local", (err, user, info) => {
  //   if (err) return res.status(400).json({ error: err });
  // });
  // if (!user) {
  //   return res.status(400).json({ errors: "No user found" });
  // }
  // req.logIn(user, (err) => {
  //   if (err) {
  //     return res.status(400).json({ error: err });
  //   }
  //   return res.status(200).json({ user });
  // })(req, res, next);
});

app.get("/payment", async (req, res, next) => {
  return res.render("payment.html");
});

app.get("/customers/:id/cards", async (req, res) => {
  const cards = await stripe.customers.listSources(req.params.id, {
    object: "card",
    limit: 3,
  });
  res.status(200).json(cards.data);
});
app.get("/authorize", (req, res) => {
  console.log(req);
});
app.post("/login", async (req, res) => {
  try {
    const persons = await stripe.accounts.listPersons("acct_1H63DSDC32qKcNvN", {
      limit: 3,
    });
    res.status(200).json({ persons });
  } catch (error) {
    console.log(error);
  }
});

app.get("/download_reciept", async (req, res) => {
  try {
    const { url } = req.query;
    const pdfPath = await printPDF(url);
    res.setHeader("Content-Disposition", "attachment; filename=reciept.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(new Buffer(pdfPath, "binary"));
  } catch (error) {
    console.log(error);
    res.send(error);
  }
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
          amount: req.body.amount * 100,
          description: req.body.description,
          currency: "usd",
          customer: customer.id,
        });
      })
      .then(async (data) => {
        console.log();
        //const pdfPath = await printPDF(data.receipt_url);
        //const response = `http://docs.google.com/gview?${pdfPath}&embedded=true`;
        res.render(`completed`, { reciept: data.receipt_url });
      })
      .catch((err) => {
        console.log(err);
        res.render("error.html");
      });
  } catch (err) {
    console.log(err);
    res.send(err.toString());
  }
});

// Future Code Goes Here

const port = process.env.PORT || 6503;
app.listen(port, () => console.log(`Server is running ${port}`));
