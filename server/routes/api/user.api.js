const express = require('express');
const jwt = require('jsonwebtoken');

const  User = require('../../models/User');
const verifyToken = require('../../middlewares/verifyToken');

const router = express.Router();

router.get('/me', verifyToken, function (req, res, next) {
    const { username } = req;

    User.findOne({ username }).then(function (user) {
        res.status(200).send(user)
    }).catch(function (err) {
        next(err);
    });
});

router.post('/', function (req, res, next) {
    const { username, password } = req.body;
    if (username === undefined) 
        return next({
            message: "Username is not provided",
            status: 422
        });
    
    if (password === undefined) 
        return next({
            message: "Password is not provided",
            status: 422
        });
    

    const user = new User({ username, password });
    user.save().then(function () {
        res.status(200).send({ user });
    }).catch(function (err) {
        next(err);
    });
});

router.get('/login', async function (req, res, next) {
    const { username, password } = req.query;

    if (username === undefined) 
        return next({
            message: "Username is not provided",
            status: 422
        });

    if (password === undefined) {
        return next({
            message: "Password is not provided",
            status: 422
        });
    }

    const user = await User.findOne({ username });
    if (!user)
        return next({
            status: 404,
            message: 'User not found'
        });

    
    if (user.password !== password) {
        return next({
            status: 404,
            message: 'Password is incorrect'
        });
    }
    
    const token = jwt.sign({ data: username }, 'lmao');
    res.status(200).send(token);
});

module.exports = router;