const { Router } = require("express"),
  router = Router();
const multer = require("multer");

const User = require("../models/User");
const auth = require("../middlewares/auth");

const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!/\.(jpg|jpeg|png)$/.test(file.originalname)) {
      return cb(new Error("the file must be an image"));
    }
    cb(undefined, true);
  }
});

router.get("/me", auth, async (req, res) => {
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

router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).json();
  }
});

router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.validate();

    const token = await user.generateAuthToken();
    await user.hashPass();
    await user.save();
    res.status(201).json({ user, token });
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.logIn(req.body.email, req.body.password);
    await user.validate();
    const token = await user.generateAuthToken();
    await user.hashPass();
    user.save();
    res.status(200).json({ user, token });
  } catch ({ message }) {
    res.status(400).json({ error: message });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

router.post(
  "/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      req.user.avatar = req.file.buffer;
      await req.user.save();
      res.send();
    } catch ({ message }) {
      res.status(500).json({ error: message });
    }
  },
  (err, req, res, next) => {
    res.status(400).json({ error: err.message });
  }
);

router.delete("/avatar", auth, async (req, res) => {
  try {
    (req.user.avatar = undefined), await req.user.save();
    res.send();
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.json(req.user);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

router.patch("/", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    await req.user.validate();
    if (updates.includes("password")) {
      await req.user.hashPass();
    }
    await req.user.save();
    res.json(req.user);
  } catch ({ message }) {
    res.status(500).json({ error: message });
  }
});

module.exports = router;
