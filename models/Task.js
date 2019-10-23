const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user"
    }
  },
  { timestamps: true }
);

module.exports = model("task", taskSchema);
