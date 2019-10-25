const { Router } = require("express"),
  router = Router();

const Task = require("../models/Task");
const auth = require("../middlewares/auth");

router.post("/", auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, author: req.user._id });
    await task.save();
    res.status(201).json(task);
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

router.get("/", auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  const options = {
    limit: parseInt(req.query.limit),
    skip: parseInt(req.query.skip)
  };
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options
      })
      .execPopulate();
    res.json(req.user.tasks);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id
    });
    if (!task) {
      return res.status(404).send();
    }
    res.json(task);
  } catch ({ message }) {
    res.status(404).json({ error: message });
  }
});

router.patch("/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id
    });
    updates.forEach(update => {
      task[update] = req.body[update];
    });
    await task.save();
    res.json(task);
  } catch ({ message }) {
    res.status(404).json({ error: message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });
    res.send(task);
  } catch ({ message }) {
    res.status(404).send();
  }
});

module.exports = router;
