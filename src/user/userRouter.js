const express = require('express');
const router = express.Router();
const UserService = require('./UserService');
const {check, validationResult} = require('express-validator')


// const validateUsername = (req, res, next) => {
//   const user = req.body;
//   if (user.username === null) {
//     req.validationErrors = {
//       username: 'username cannot be null',
//     };
//   }
//   next();
// };

// const validateEmail = (req, res, next) => {
//   const user = req.body;
//   if (user.email === null) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: 'email cannot be null',
//     };
//   }
//   next();
// };

router.post('/api/1.0/users', check('username').notEmpty().withMessage('username cannot be null').bail().isLength({min: 4, max: 32}).withMessage('Must have min 4 and max 32 character'), 
check('email').notEmpty().withMessage('email cannot be null').bail()
.isEmail().withMessage('email is not valid'), check('password').notEmpty().withMessage('password cannot be null').bail().isLength({min:6}).withMessage('password must be at least 6 character').bail()
.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage('password must be at uppercase character,1 lowercase character and 1 number'),async (req, res) => {
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    const validationErrors = {}
    errors.array().forEach(error => validationErrors[error.param] = error.msg)
    return res.status(400).send({validationErrors})
  }
  console.log(errors)
  await UserService.save(req.body);
  return res.send({ message: 'User created' });
});

module.exports = router;
