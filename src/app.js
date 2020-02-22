const path = require("path");
const express = require("express");
const nodeMailer = require("nodemailer");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const fileService = require("./util/fileService");
// const events = require("./router/events");
const hbs = require("./util/handlebars");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000; //PORT has to be in capital

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// middleware
app.use("", (req, res, next) => {
    if (req.query.lang == "en") {
        res.cookie("lang", "en", { maxAge: 86400000, httpOnly: true });
        req.lang = "en";
    } else if (req.query.lang == "zh") {
        res.cookie("lang", "zh", { maxAge: 86400000, httpOnly: true });
        req.lang = "zh";
    } else if (req.cookies["lang"]) {
        req.lang = req.cookies["lang"];
    } else {
        res.cookie("lang", "zh", { maxAge: 86400000, httpOnly: true });
        req.lang = "zh";
    }

    req.headerContent = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "header.json"), "utf8")
    );
    req.footerContent = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "footer.json"), "utf8")
    );

    next();
});

// router
// app.use("/events", events);

app.get("", (req, res) => {
    const headline_news = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "headline-news.json"), "utf8")
    );
    res.render("index", { headline_news, header: req.headerContent, footer: req.footerContent });
});

app.get("/about", (req, res) => {
    const about = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "about.json"), "utf8")
    );
    res.render("about", {about, header: req.headerContent, footer: req.footerContent});
});

app.get("/questions", (req, res) => {
    const questions = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "questions.json"), "utf8")
    );
    res.render("questions", { questions, header: req.headerContent, footer: req.footerContent });
});

app.get("/contact", (req, res) => {
    const contact = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "contact.json"), "utf8")
    );
    res.render("contact", {contact, header: req.headerContent, footer: req.footerContent});
});

app.get("/downloads", (req, res) => {
    const downloads = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", req.lang, "downloads.json"), "utf8")
    );
    let files = [];
    const dir = path.join(__dirname, "../public/files/downloads");
    fileService.walkDir(dir, files);
    files = files
        // .filter((f) => f.file_name.endsWith(".pdf"))
        .sort((f1, f2) => f1.create_time < f2.create_time);

    res.render("downloads", { downloads, files, header: req.headerContent, footer: req.footerContent });
});

// must put at last one
app.get("*", (req, res) => {
    res.status(404).render("404");
});

app.post("/send-email", (req, res) => {
    // let transporter = nodeMailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         // should be replaced with real sender's account
    //         user: "gordonyuzr@gmail.com",
    //         pass: "golden3151297517"
    //     }
    // });

    let transporter = nodeMailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_SENDER_ADDRESS,
            pass: process.env.EMAIL_SENDER_PASSWORD
        }
    });

    let mailOptions = {
        // should be replaced with real recipient's account
        to: "golden129315@gmail.com",
        subject: req.body.subject + "----Received Website Message",
        text: req.body.message + "\n\n---- From: \n" + req.body.name + "\n" + req.body.email
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
    });
    res.send({});
});

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
