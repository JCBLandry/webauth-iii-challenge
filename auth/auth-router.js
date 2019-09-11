const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js')

const Users = require('../users/users_model.js');

// for endpoints beginning with /api/auth
router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      const token = generateToken(saved);
      //create a session 
      //send back a cookie that corponds to session
      res.status(201).json({
        user: saved,
        token
      });
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
      //create a session, !!already done in middleware
      //send back a cookie that corponds to session!! also already done thanks to lib
      //add info about our user to session
        res.status(200).json({
          message: `Welcome ${user.username}!, have a token!`, token
        });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.get('/logout', (req, res) =>{
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.json({message: 'didnt work'});
      } else {
        res.end();
      }
    })
  }
});

function generateToken(user){
  const payload = {
    sub: user.id,
    username: user.username,
    department: user.department
  };

  const options = {
    expiresIn: '1d'
  };

  return jwt.sign(payload, secrets.jwtSecret, options);
}


module.exports = router;