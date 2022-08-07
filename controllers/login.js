const jwt = require('jsonwebtoken');
const bcrypt=require('bcrypt');

const loginRouter = require('express').Router();
const config = require('../utils/config');
const User = require('../models/user');

loginRouter.post('/',async (request, response) => {
    const { username, password } = request.body;

    const userPresent = await User.findOne({ username });
    const userPwd = userPresent === null ? false : await bcrypt.compare(password, userPresent.passwordHash);

    if (!(userPresent && userPwd)) {
        return response.status(401).send({ error: 'Invalid username or password' });
    }

    const userInput = {
        username: userPresent.username,
        id: userPresent._id
    }

    const jwtToken = jwt.sign(userInput, config.SECRET, { expiresIn: 60 * 60 });
    response.status(200).send({ jwtToken, username: userPresent.username, name: userPresent.name });

});

module.exports = loginRouter;