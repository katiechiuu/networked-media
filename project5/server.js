const express = require("express");

const app = express();
const PORT = 8001;

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (request, response) => {
  response.render("index.ejs");
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:8001`);
});