const express = require('express');
const mysql = require('mysql2/promise');

const { dbConfig } = require('../../config');
const { isLoggedIn } = require('../../middleware');

require('dotenv').config();

const router = express.Router();
// Create account data
router.post('/accounts', isLoggedIn, async (req, res) => {
  const { group_id } = req.body;
  if (!group_id) {
    return res.status(400).send({ err: 'Incorrect data' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `INSERT INTO accounts(group_id, user_id)VALUES(${mysql.escape(
      group_id,
    )},
       ${mysql.escape(req.user.id)}) `;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'try again' });
  }
});
//GET: /accounts/ - paduoda visas vartotojo grupes (JOIN su groups). ID pasiima iš token.
router.get('/accounts', isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  const query = ` SELECT accounts.user_id, accounts.group_id, groups1.name FROM accounts LEFT JOIN groups1  ON accounts.group_id = groups1.id WHERE accounts.user_id = ${mysql.escape(
    userId,
  )} GROUP BY accounts.user_id, accounts.group_id, groups1.name`;

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err });
  }
});
//Post groups name
router.post('/groups', isLoggedIn, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).send({ err: 'Incorrect data' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `INSERT INTO groups1 (name) VALUES
    (${mysql.escape(name)}) `;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server error' });
  }
});

//GET: /bills/:id - paduoda vartotojui visas sąskaitas tos grupės.

router.get('/bills/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const query = `SELECT bils.* FROM bils LEFT JOIN groups1
   ON (groups1.id = bils.group_id)${
     id ? `WHERE groups1.id = ${mysql.escape(id)}` : ''
   }`;
  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(query);
    await con.end();

    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err });
  }
});

//POST /bills/ - įrašo naują sąskaitą specifinei grupei (front'as paduoda: group_id, amount, description)

router.post('/bills', isLoggedIn, async (req, res) => {
  const { group_id, amount, description } = req.body;

  if (!group_id || !amount || !description) {
    return res.status(400).send({ err: 'Incorrect data passed' });
  }
  try {
    const con = await mysql.createConnection(dbConfig);
    const query = `
      INSERT INTO bils ( group_id, amount, description ) 
      VALUES ( ${mysql.escape(group_id)},
       ${mysql.escape(amount)}, ${mysql.escape(description)})`;
    const [data] = await con.execute(query);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Please try again' });
  }
});
module.exports = router;
