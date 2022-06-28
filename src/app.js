require('dotenv').config();
const express = require("express");
const path = require("path");
require("./db/conn");
const app = express();
const hbs = require("hbs");
const Register = require("./models/registers");
// const router = require("./routers/men")
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const auth = require("./middleware/auth");

// console.log(path.join(__dirname));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
// app.use(router);

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/secret", auth , (req, res) => {
    // console.log(`this is the cookie awesome ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/logout", auth , async(req, res) => {
    try{
        console.log(req.user);

        //for single logout
        // req.user.tokens = req.user.tokens.filter((currElem) => {
        //     return currElem.token !== req.token;
        // })

        //logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        console.log("logout successfully");

        await req.user.save();
        res.render("login");
    }
    catch(err){
        res.status(500).send(error);
    }
})

app.get("/about", (req, res) => {
    res.render('about')
})

app.get("/weather", (req, res) => {
    res.render('weather')
})

app.get("/login", (req, res) => {
    res.render('login')
})

app.get("/register", (req, res) => {
    res.render('register')
})

app.get("*", (req, res) => {
    res.render('404page', {
        errorMsg: "Opps! page not found, Click Here to go back"
    })
})

//create a new user in our database
app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: cpassword,
            });

            const token = await registerEmployee.generateAuthToken();
            console.log(token);
            //password hash

            res.cookie("jwt", token,{
                expires: new Date(Date.now() + 50000),
                httpOnly: true,
            });

            const registered = await registerEmployee.save();
            res.status(201).render("index");
        }
        else {
            res.send("password are not matching");
        }
        // console.log(req.body.firstname);
        // res.send(req.body.firstname);
    }
    catch (error) {
        res.status(400).send(error);
        console.log("the error part page");
    }
})


//login check
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        // console.log(`${email} and password is ${password}`);

        const useremail = await Register.findOne({ email: email });
        // res.send(useremail);
        // console.log(useremail);
        const isMatch = await bcrypt.compare(password, useremail.password);

        // Login Form Signing In User with JWT OAuth Token
        const token = await useremail.generateAuthToken();
        console.log(token);

        res.cookie("jwt", token,{
            expires: new Date(Date.now() + 60000),
            httpOnly: true,
            // secure: true
        });

        if (isMatch) {
            res.status(201).render('index');
        }
        else {
            res.send("Invalid password details");
        }
    }
    catch (error) {
        res.status(400).send("Invalid login details");
    }
})

app.listen(port, () => {
    console.log(`connection is setup at ${port}`);
})