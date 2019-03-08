const express = require('express');

const User = require('../../models/User');
const Project = require('../../models/Project');

const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();
const authRouter = express.Router();

/**
 * Routes require user loged in and request with token
 * req: { username, userId }
 * prefix: 'm/'
 */
authRouter.use(verifyToken);
router.use('/m', authRouter);


// Get all projects of an user
router.get('/user/:username', (req, res) => {
  const { username } = req.params;
  User.findOne({ username }, '-password').populate('projects').then((user) => {
    if (!user) res.status(404).send({ msg: 'User not found' });
    res.status(200).send(user);
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ msg: err.message });
  });
});

// Get all my projects
authRouter.get('/all', (req, res) => {
  const { username, userId } = req;
  User.findById(userId, '-password').populate('projects').then((user) => {
    if (!user) res.status(404).send({ msg: 'User not found' });
    res.status(200).send(user);
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ msg: err.message });
  });
});

// Get project data
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  Project.findById(projectId, (err, project) => {
    if (err) {
      console.log(err);
      res.status(50).send({ msg: err.message });
    }
    if (!project) res.status(404).send({ msg: 'Project not found' });
    res.status(200).json(project);
  });
});

// New project
authRouter.post('/create', (req, res) => {
  const { name } = req.body;
  const { username, userId } = req;
  const project = new Project({
    name,
    creator: userId
  });
  project.save((err, project) => {
    if (err) {
      console.log(err);
      res.status(500).send({ msg: err.message });
    }
    User.findByIdAndUpdate(userId, {
      $addToSet: {
        projects: project._id
      }
    }).then(() => {
      res.status(200).json(project);
    }).catch((err) => {
      console.log(err);
      res.status(500).send({ msg: err.message });
    });
  });
});

authRouter.post('/:projectId/invite', (req, res) => {
  const { projectId } = req.params;
  const { memberId } = req.body;
  const { username, userId } = req;
  Project.findById(projectId).then((project) => {
    if (!project) return res.status(404).send({ msg: 'Project not found' });
    const members = project.members;
    if (userId != project.creator && !members.find(u => u == userId)) {
      return res.status(400).send({ msg: 'You dont have permission for this project' });
    }
    return Project.findByIdAndUpdate(projectId, {
      $addToSet: {
        members: memberId
      }
    }).then(project => User.findByIdAndUpdate(memberId, {
      $addToSet: {
        projects: projectId
      }
    })).then(() => {
      res.status(200).send({ msg: 'Invite successfully' });
    });
  })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ msg: err.message });
    });
});

// add column to a project
authRouter.post('/:projectId/col/add', (req, res) => {
  const { projectId } = req.params;
  const { name } = req.body;
  const { username, userId } = req;
  Project.findById(projectId).then((project) => {
    if (!project) return res.status(404).send({ msg: 'Project not found' });
    const members = project.members;
    if (userId != project.creator && !members.find(u => u == userId)) {
      return res.status(400).send({ msg: 'You dont have permission for this project' });
    }
    project.cols.push({ name });
    return project.save().then((project) => {
      res.status(200).send(project);
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ msg: err.message });
  });
});

// add item to a column in a project
authRouter.post('/:projectId/col/:colId/item/add', (req, res) => {
  const { projectId, colId } = req.params;
  const { note, start, due } = req.body;
  const { username, userId } = req;
  Project.findById(projectId).then((project) => {
    if (!project) return res.status(404).send({ msg: 'Project not found' });
    const members = project.members;
    if (userId != project.creator && !members.find(u => u == userId)) {
      return res.status(400).send({ msg: 'You dont have permission for this project' });
    }
    const colIdx = project.cols.findIndex(u => u._id == colId);
    if (colId == -1) return res.status(400).send({ msg: 'Column is not exist' });
    project.cols[colIdx].items.push({
      note, start, due,
      author: userId
    });
    return project.save().then(() => {
      res.status(200).send({ msg: 'Add item successfully' });
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ msg: err.message });
  });
});


module.exports = router;
