const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel } = require("../Models/user.model");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");

//for registering a new user
userRouter.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userinDb = await UserModel.findOne({ email });
    if (userinDb) {
      return res.status(400).json({ msg: "User already registered" });
    }
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ msg: "some internal errror" });
      }
      const user = new UserModel({
        email,
        password: hash,
        wrong_count: 0,
        deadline: 0,
      });
      await user.save();
      res.status(201).send({ msg: "registered successfully!!!" });
    });
  } catch (err) {
    res.status(401).send({ msg: "some internal error" });
  }
});
//for login  user
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const curr_time = new Date().getTime();
  try {
    let user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        msg: `user not found`,
      });
    }
    if (user.wrong_count >= 5 && user.deadline > curr_time) {
      return res.status(401).send({
        msg: `you are blocked try after ${new Date(
          user.deadline
        ).toLocaleString()}`,
      });
    }
    if (user.wrong_count >= 5 && user.deadline < curr_time) {
      user.wrong_count = 0;
      user.deadline = 0;
      await user.save();
    }
    bcrypt.compare(password, user.password, async (err, result) => {
      if (result) {
        user.wrong_count = 0;
        user.deadline = 0;
        await user.save();
        const token = jwt.sign({ userId: user._id }, "secret");
        res.status(200).send({ msg: "login Success", token });
      } else {
        user.wrong_count++;
        if (user.wrong_count >= 5) {
          const day = 24 * 60 * 60 * 1000;
          user.deadline = curr_time + day;
        }
        user.save();
        res.status(401).send({
          msg: `Wrong Password its your ${user.wrong_count} failed attempts`,
        });
      }
    });
  } catch (e) {
    res.status(500).send({ msg: "some internal error" });
  }
});

module.exports = { userRouter };
