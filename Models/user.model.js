const { default: mongoose } = require("mongoose");

const userSchema = mongoose.Schema({
  email: String,
  password: String,
  wrong_count: Number,
  deadline: Number,
});

const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };
