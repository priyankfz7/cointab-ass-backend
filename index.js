const express = require("express");
const { connection } = require("./Config/db");
const cors = require("cors");
const { userRouter } = require("./Routes/users.routes");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Cointab Assignment Backend");
});
app.use("/users", userRouter);

app.listen(8080, async () => {
  try {
    connection;
    console.log("connected to db");
  } catch (e) {
    console.log(e);
  }
  console.log("Server is running at http://localhost:8080");
});
