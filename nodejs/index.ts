const express = require('express');
const cors = require('cors');
const path = require("path");
import { router as accountRouter } from "./controller/accountController";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/account", accountRouter);

// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (_req: any, res: any) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(3000, () => {
    console.log("Bank Simulator running at http://localhost:3000");
});