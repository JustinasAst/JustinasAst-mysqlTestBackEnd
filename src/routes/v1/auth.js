const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { dbConfig, jwtSecret } = require('../../config');

const router = express.Router();

const userSchema = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(6).max(30).required(),
});

// REGISTRATION
router.post('/register', async (req, res) => {
  let userInputs = req.body;

  try {
    userInputs = await userSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(400).send({ err: 'Incorrect data provided' });
  }
  const encryptedPassword = bcrypt.hashSync(userInputs.password);

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `INSERT INTO users6(full_name, email, password)VALUES
      (${mysql.escape(userInputs.full_name)}
        , ${mysql.escape(userInputs.email)},
        '${encryptedPassword}')`,
    );
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server error' });
  }
});
router.post('/login', async (req, res) => {
  const loginSchema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  let userInputs = req.body;
  try {
    userInputs = await loginSchema.validateAsync(userInputs);
  } catch (err) {
    return res.status(401).send({ err: 'Wrong email or password' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(
      `SELECT * FROM users6 WHERE email = ${mysql.escape(
        userInputs.email,
      )}LIMIT 1`,
    );
    await con.end();
    const passwordCorect = bcrypt.compareSync(
      userInputs.password,
      data[0].password,
    );
    if (!passwordCorect) {
      return res.status(400).send({ err: 'Incorect password' });
    }
    const token = jwt.sign(
      {
        id: data[0].id,
        email: data[0].email,
      },
      jwtSecret,
    );
    return passwordCorect
      ? res.send({ token })
      : res.status(400).send({ err: 'Incorect email or password' });
  } catch (err) {
    return res.status(500).send({ err });
  }
});
module.exports = router;
