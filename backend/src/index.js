require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passwordGate = require("./middleware/passwordGate");
const dailyLogsRouter = require("./routes/dailyLogs");
const companiesRouter = require("./routes/companies");

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/login", (req, res) => {
  const { password } = req.body || {};
  if (password === process.env.APP_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false });
});

app.use("/api", passwordGate);
app.use("/api/daily-log", dailyLogsRouter);
app.use("/api/companies", companiesRouter);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
