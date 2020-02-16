const express = require("express");
const router = express.Router();
const fileService = require("../util/fileService");
const path = require("path");
const fs = require("fs");

// router.get("/", async (req, res) => {
//     try {
//         let history_events = await Event.find({
//             event_date: { $lte: new Date() }
//         }).sort({ event_date: -1 });
//         history_events = history_events.map((event) => {
//             return event.toJSON();
//         });
//         let future_events = await Event.find({
//             event_date: { $gt: new Date() }
//         }).sort({ event_date: 1 });
//         future_events = future_events.map((event) => {
//             return event.toJSON();
//         });
//         const login = req.token ? true : false;
//         res.render("events", { login, history_events, future_events });
//     } catch (e) {
//         res.status(500).redirect("/");
//     }
// });

router.get("/create", (req, res) => {
    res.render("create-event");
});


module.exports = router;
