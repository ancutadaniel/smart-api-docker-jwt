const jwt = require('jsonwebtoken');
const redis = require('redis');

// Setup redis
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleRegister = (db, bcrypt, req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return Promise.reject('Incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
  return db
    .transaction((trx) => {
      trx
        .insert({
          hash: hash,
          email: email,
        })
        .into('login')
        .returning('email')
        .then((loginEmail) => {
          return trx('users')
            .returning('*')
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date(),
            })
            .then((user) => user[0])
            .catch((err) => Promise.reject('Unable to get user')); // return user
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch((err) => Promise.reject('Unable to register'));
};

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, 'JWT_SECRET', { expiresIn: '2 days' });
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSessions = (user) => {
  // JWT token, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: 'true', user, token };
    })
    .catch((err) => console.log(err));
};

const registerAuthentication = (db, bcrypt) => (req, res) => {
  return handleRegister(db, bcrypt, req, res)
    .then((data) => {
      return data && data.email ? createSessions(data) : Promise.reject(data); // create token
    })
    .then((session) => res.json(session)) // return promise to FE
    .catch((err) => res.json(err));
};

module.exports = {
  handleRegister,
  registerAuthentication,
};
