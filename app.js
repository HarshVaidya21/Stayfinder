const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const port = 8080;

app.listen(port, (req, res) => {
    console.log(`server is listening:${port}`);
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join((__dirname, "/public"))));//for serving static files

app.use(express.static(path.join((__dirname, "public"))));
app.use(express.urlencoded({ extended: true }));

app.engine('ejs', ejsMate);

app.get("/", (req, res) => {
    res.send("Welcome to Stayfinder");
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/Stayfinder');

}
main().then(() => {
    console.log("connection successfull");
}).catch((err) => {
    console.log(err);
})
app.use(methodOverride('_method'));

app.get("/listings", async (req, res, next) => {
    try {
        const allListing = await Listing.find({});
        res.render("../views/listings/index.ejs", { allListing });

    } catch (err) {
        next(err);
    }



});



app.get("/listing/new", (req, res) => {
    res.render("../views/listings/form.ejs");
})

app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    let listings = await Listing.findById(id);


    res.render("../views/listings/newedit.ejs", { listings });
})

//UPDATE

app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let { desc } = req.body;
    let listings = await Listing.findByIdAndUpdate(id, { description: desc }, { new: true, runValidators: true });
    console.log(listings);
    res.redirect("/listings");

})

//DELETE ROUTE
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log("successfully deleted");
    res.redirect("/listings");

})
// show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    let alldetails = await Listing.findById(id);
    res.render("../views/listings/show.ejs", { alldetails });
});
app.post("/listings", async (req, res) => {
    let listing = req.body.listing;
    const newlisting = new Listing(listing);
    await newlisting.save();
    res.redirect("/listings")
})
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).send(message);
})
