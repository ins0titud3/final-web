// server.js
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const User = require('./models/user.js') // Подключаем модель пользователя
const authController = require('./controllers/authController.js') // Подключаем контроллер аутентификации
const flash = require('express-flash')
const axios = require('axios')
const postController = require('./controllers/postController')
const postRoutes = require('./routes/post')

dotenv.config()

const app = express()
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(flash())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
)
app.use(passport.initialize())
app.use(passport.session())

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err))

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error') })
})

app.post('/login', authController.login)

app.get('/signup', (req, res) => {
  res.render('signup', { error: req.flash('error') })
})
app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

app.post('/signup', authController.signup)

app.get('/home', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login')
  }

  try {
    // Запрос к первому API для рекомендаций музыки
    const options1 = {
      method: 'GET',
      url: 'https://shazam.p.rapidapi.com/charts/track',
      params: {
        locale: 'en-US',
        pageSize: '15',
        startFrom: '0',
      },
      headers: {
        'X-RapidAPI-Key': '29b4b81962msh12c666fcf3fcabep10bc3djsn03be47fc0c0f',
        'X-RapidAPI-Host': 'shazam.p.rapidapi.com',
      },
    }

    // Запрос к второму API для жанров музыки
    const options2 = {
      method: 'GET',
      url: 'https://shazam-core7.p.rapidapi.com/charts/get-top-songs-in_world_by_genre',
      params: {
        genre: req.query.genre || 'pop', // Если жанр не выбран, то по умолчанию выбираем House
        limit: '10',
      },
      headers: {
        'X-RapidAPI-Key': '29b4b81962msh12c666fcf3fcabep10bc3djsn03be47fc0c0f',
        'X-RapidAPI-Host': 'shazam-core7.p.rapidapi.com',
      },
    }

    // Выполнение обоих запросов параллельно
    const [response1, response2] = await Promise.all([
      axios.request(options1),
      axios.request(options2),
    ])

    // Преобразование данных из первого API
    const tracks1 = response1.data.tracks.map(track => ({
      image: track.images.coverarthq,
      title: track.title,
      audio: track.hub.actions.find(action => action.type === 'applemusicplay').uri,
    }))

    // Преобразование данных из второго API
    const tracks2 = response2.data.tracks.map(track => ({
      image: track.images.coverarthq,
      title: track.title,
      audio: track.hub.actions.find(action => action.type === 'applemusicplay').uri,
    }))
    // Получаем обновленный список постов и передаем его в шаблон
    const posts = await postController.getPosts(req, res)
    res.render('home.ejs', { user: req.session.user, tracks1, tracks2, posts })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/admin', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login')
  }

  res.render('admin.ejs', { user: req.session.user })
})

// Create post
app.post('/admin/create', postController.createPost)

// Get post
app.get('/admin/get', postController.getPosts)

// Update post
app.post('/admin/update', postController.updatePost)

// Delete post
app.delete('/admin/delete', postController.deletePost)

app.use('/api', postRoutes)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`)
})
