// controllers/authController.js
const User = require('../models/user')
const bcrypt = require('bcrypt')

exports.login = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.render('login', { error: 'Invalid username or password' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.render('login', { error: 'Invalid username or password' })
    }

    req.session.user = user
    res.redirect(user.role === 'admin' ? '/admin' : '/home')
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

exports.signup = async (req, res) => {
  const { username, password } = req.body
  try {
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      req.flash('error', 'Username already exists')
      res.redirect('/signup')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ username, password: hashedPassword })
      await newUser.save()
      res.redirect('/home')
    }
  } catch (error) {
    console.error(error)
    req.flash('error', 'Internal Server Error')
    res.redirect('/signup')
  }
}
