import express from "express";

const app = express();
const PORT = 5000;

app.get("/", (_req, res) => {
  res.send("Collabridge API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
