const { Router } = require("express"),
  router = Router();

const User = require("../models/User");
const auth = require("../middlewares/auth");

router.get("/me", auth, async (req, res) => {
  console.log(req.user);
  res.json(req.user);
});

router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch ({ message }) {
    res.status(404).json({ error: message });
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.logIn(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(200).json({ user, token });
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.json(user);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

router.put("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const user = await User.findById(req.params.id);
    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save(req.body);

    res.json(user);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

module.exports = router;
