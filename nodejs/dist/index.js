var express = require('express');
var path = require("path");
var app = express();
app.use(express.json());
// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (_req, res) {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});
app.listen(3000, function () {
    console.log("Bank Simulator running at http://localhost:3000");
});
