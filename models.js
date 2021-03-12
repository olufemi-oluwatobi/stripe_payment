var mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");
var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]$/, "is invalid"],
      index: true,
    },
    firstname: String,
    lastname: String,
    salt: String,
    hash: String,
    password: String,
  },
  { timestamps: true }
);
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    firstname: this.firstname,
    lastname: this.lastname,
    token: this.generateJWT(),
  };
};
UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    },
    SECRET_KEY
  );
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
