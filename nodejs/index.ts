const express = require('express');
const path = require("path");
const app = express();

app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
    console.log("Bank Simulator running at http://localhost:3000");
});