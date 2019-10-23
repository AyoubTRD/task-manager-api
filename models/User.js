const { Schema, model } = require("mongoose");
const { isEmail } = require("validator");
const { hash, compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");

const Task = require("./Task");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      toLowerCase: true,
      validate(email) {
        if (!isEmail(email)) {
          throw new Error("incorrect email");
        }
      }
    },
    password: {
      type: String,
      required: true,
      validate(password) {
        if (password.length < 6) {
          throw new Error("password must be at least 6 characters long");
        }
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre("remove", async function(next) {
  await Task.deleteMany({ author: this._id });
  next();
});

userSchema.virtual("tasks", {
  ref: "task",
  localField: "_id",
  foreignField: "author"
});

userSchema.methods.toJSON = function() {
  const { _doc: user } = this;
  return { ...user, password: undefined, tokens: undefined };
};

userSchema.methods.generateAuthToken = async function() {
  const token = sign({ _id: this._id }, "auth");
  this.tokens = [...this.tokens, { token }];
  return token;
};

userSchema.statics.logIn = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("cannot login");
  }
  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    throw new Error("cannot login");
  }
  return user;
};

userSchema.methods.hashPass = async function() {
  try {
    const passHash = await hash(this.password, 8);
    this.password = passHash;
  } catch (err) {
    throw new Error("an error occured!");
  }
};

const User = model("user", userSchema);

module.exports = User;
