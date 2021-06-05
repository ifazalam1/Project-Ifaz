const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyparser = require("body-parser");
var cookiesession = require("cookie-session");
dotenv.config();
const port = process.env.PORT || 3000;
// getting-started.js
const mongoose = require("mongoose");
const connection = mongoose.connect("mongodb://localhost/group3database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Item = require("./models/Items");
const User = require("./models/Users");
app.use(
  cookiesession({
    name: "session",
    keys: ["sbhahdsnkjdjknhaskjxchaqwkejkjwqkekj"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(express.static("views/static"));
app.set("views", "./views/public/pages");
app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/registration", (req, res) => {
  console.log("Reached admin registrion  page");
  const user = req.session.user;
  if (user) {
    return res.redirect("/");
  }
  const failure = req.session.failed;
  req.session.failed = null;
  console.log(`Got registration page with the failure : ${failure}`);
  res.render("registration", { user, failure });
});

app.post("/registration", async (req, res) => {
  console.log("posted admin registrion  data");
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  const secret = +req.body.secret;
  if (secret === 666) {
    let registeringUser = new User({
      username,
      password,
    });
    let user = await registeringUser.save();
    req.session.user = user;
    return res.redirect("/");
  }
  console.log("failed");
  req.session.failed = "Secret code wrong";
  res.redirect("/registration");
});

app.get("/login", (req, res) => {
  console.log("Reached admin login page");
  const user = req.session.user;
  const loginFailed = req.session.loginFailed;
  req.session.loginFailed = null;
  if (user) {
    res.redirect("/");
  } else {
    res.render("login", { user, loginFailed });
  }
});

app.post("/login", async (req, res) => {
  console.log("Posted admin login information", req.body);
  let findUser = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (findUser) {
    console.log("found user");
    const user = findUser;
    req.session.user = user;
    console.log(findUser);
    res.redirect("/");
  } else {
    req.session.loginFailed = "Incorrect Credentials, Please Retry";
    console.log("Nope did not match");
    res.redirect("/login");
  }
});

app.get("/menu", async (req, res) => {
  console.log("Reached menu page");
  const user = req.session.user;
  const menu = await Item.find({});
  const menuView = menu.map((item, index) => {
    return `
            <div class="foodItem">
                  <div class="content">
                  <img src="${item.itemImageUrl}" />
                  <h3>${item.itemName}</h3>
                  <p>${item.itemPrice} Taka</p>
                  </div>
              </div>
              `;
  });
  res.render("menu", { user, menu: menuView });
});

app.get("/addItem", (req, res) => {
  console.log("Reached add item page");
  const user = req.session.user;
  if (!user) {
    res.redirect("/");
  } else {
    res.render("addItems", { user });
  }
});

app.post("/addItem", async (req, res) => {
  console.log("Uploaded Item", req.body);
  try {
    let items = new Item(req.body);
    await items.save();
  } catch (error) {
    console.log(error);
  }
  res.redirect("/addItem");
});

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

app.get("/contact", (req, res) => {
  const user = req.session.user;
  res.render("contact", { user });
});

app.get("/", (req, res) => {
  console.log("Reached index page");
  const user = req.session.user;
  res.render("index", { user });
});

app.listen(port, async () => {
  try {
    await connection;
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
  console.log(`Server running at localhost:${port}`);
});
