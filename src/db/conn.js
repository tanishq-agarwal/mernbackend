const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/formRegistration", {useNewUrlParser: true, useUnifiedTopology: true})
.then( () => console.log("connection successfull..."))
.catch((err) => console.log(err));