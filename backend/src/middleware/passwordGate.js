function passwordGate(req, res, next) {
  const provided = req.header("x-app-password");
  if (provided !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

module.exports = passwordGate;
