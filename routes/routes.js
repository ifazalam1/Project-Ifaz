const express = require("express");
const router = express.Router();
const Item = require("../models/Items");
const User = require("../models/Users");
const path = require("path"); // Ensure path is required if handling file deletion
const fs = require("fs"); // Ensure fs is required if deleting files




// Registration routes
router.get("/registration", (req, res) => {
  console.log("Reached admin registration page");
  const user = req.session.user;
  if (user) return res.redirect("/");
  
  const failure = req.session.failed;
  req.session.failed = null;
  console.log(`Got registration page with the failure: ${failure}`);
  res.render("registration", { user, failure });
});

router.post("/registration", async (req, res) => {
  console.log("Posted admin registration data", req.body);
  const { username, password, secret } = req.body;

  if (+secret === 666) {
    let registeringUser = new User({ username, password });
    let user = await registeringUser.save();
    req.session.user = user;
    return res.redirect("/");
  }

  console.log("Registration failed: Wrong secret code");
  req.session.failed = "Secret code wrong";
  res.redirect("/registration");
});

// Login routes
router.get("/login", (req, res) => {
  console.log("Reached admin login page");
  const user = req.session.user;
  const loginFailed = req.session.loginFailed;
  req.session.loginFailed = null;

  if (user) res.redirect("/");
  else res.render("login", { user, loginFailed });
});

router.post("/login", async (req, res) => {
  console.log("Posted admin login information", req.body);
  let findUser = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (findUser) {
    console.log("User found");
    req.session.user = findUser;
    res.redirect("/");
  } else {
    console.log("Login failed: Incorrect credentials");
    req.session.loginFailed = "Incorrect Credentials, Please Retry";
    res.redirect("/login");
  }
});

// Menu route
router.get("/menu", async (req, res) => {
  console.log("Reached menu page");
  const user = req.session.user;
  const menu = await Item.find({});

  const menuView = menu.map((item) => `
      <div class="foodItem">
          <div class="content">
              <img src="${item.itemImageUrl}" />
              <h3>${item.itemName}</h3>
              <p>${item.itemPrice} Taka</p>
              <div class="actions">
                  <a href="/edit/${item._id}"><i class="fas fa-edit"></i> Edit</a>
                  <a href="/delete/${item._id}"><i class="fas fa-trash"></i> Delete</a>
              </div>
          </div>
      </div>
  `);
  
  res.render("menu", { user, menu: menuView });
});

// Add Item routes
router.get("/addItem", (req, res) => {
  console.log("Reached add item page");
  const user = req.session.user;
  
  if (!user) res.redirect("/");
  else res.render("addItems", { user });
});

router.post("/addItem", async (req, res) => {
  console.log("Uploaded Item", req.body);
  
  try {
    let items = new Item(req.body);
    await items.save();
  } catch (error) {
    console.log(error);
  }
  
  res.redirect("/addItem");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

// Contact page
router.get("/contact", (req, res) => {
  const user = req.session.user;
  res.render("contact", { user });
});

// Home page
router.get("/", (req, res) => {
  console.log("Reached index page");
  const user = req.session.user;
  res.render("index", { user });
});

// Delete

router.get('/delete/:id', async (req, res) => {
    try {
        console.log("Deleting Item with ID:", req.params.id); // Debugging

        const result = await Item.findByIdAndDelete(req.params.id); 

        if (!result) {
            console.log("Item not found in database"); // Debugging
            req.session.message = {
                type: 'danger',
                message: 'Item not found!',
            };
            return res.redirect("/menu"); // Redirect back to menu
        }

        console.log("Item deleted successfully!"); // Debugging
        req.session.message = {
            type: 'success',
            message: 'Item deleted successfully!',
        };

        res.redirect("/menu"); // Redirect to menu after deletion

    } catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).json({ message: err.message });
    }
});


// GET: Show edit form for one item
router.get("/edit/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.redirect("/menu");

    res.render("editItem", { item, user: req.session.user });
  } catch (err) {
    console.error("Error loading edit page:", err);
    res.status(500).send("Something went wrong.");
  }
});

// POST: Update the item
router.post("/edit/:id", async (req, res) => {
  try {
    const { itemName, itemPrice, itemImageUrl } = req.body;

    await Item.findByIdAndUpdate(req.params.id, {
      itemName,
      itemPrice,
      itemImageUrl,
    });

    res.redirect("/menu");
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Something went wrong.");
  }
});



module.exports = router;
