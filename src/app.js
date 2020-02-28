const path = require("path");
const express = require("express");
const nodeMailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const fileService = require("./util/fileService");
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
    } else if (req.headers["accept-language"].startsWith("zh")) {
        req.lang = "zh";
    } else {
        req.lang = "en";
    }

    req.webContent = {
        header: fileService.parseFile(req.lang, "header.json"),
        footer: fileService.parseFile(req.lang, "footer.json"),
        about: fileService.parseFile(req.lang, "about.json"),
        contact: fileService.parseFile(req.lang, "contact.json"),
        questions: fileService.parseFile(req.lang, "questions.json"),
        headline_news: fileService.parseFile(req.lang, "headline-news.json"),
        downloads: fileService.parseFile(req.lang, "downloads.json")
    };

    next();
});

app.get("", (req, res) => {
    const { header, footer, about, contact, headline_news } = req.webContent;
    res.render("index", { header, footer, about, contact, headline_news });
});

app.get("/about", (req, res) => {
    const { header, footer, about } = req.webContent;
    res.render("about", { header, footer, about });
});

app.get("/questions", (req, res) => {
    const { header, footer, questions } = req.webContent;
    res.render("questions", { header, footer, questions });
});

app.get("/contact", (req, res) => {
    const { header, footer, contact } = req.webContent;
    res.render("contact", { header, footer, contact });
});

app.get("/downloads", (req, res) => {
    const { header, footer, downloads } = req.webContent;

    let files = [];
    const dir = path.join(__dirname, "../public/files/downloads");
    fileService.walkDir(dir, files);
    files = files
        // .filter((f) => f.file_name.endsWith(".pdf"))
        .sort((f1, f2) => f1.create_time < f2.create_time);

    res.render("downloads", { header, footer, downloads, files });
});

// must put at last one
app.get("*", (req, res) => {
    const { header, footer } = req.webContent;
    res.status(404).render("404", { header, footer });
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
