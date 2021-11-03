// Loading Module
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express()
  const admin = require('./routes/admin')
  const users = require('./routes/users')
  const path = require('path')
  const mongoose = require('mongoose')
  const session = require('express-session')
  const flash = require('connect-flash')
  require("./models/Post")
  const Post = mongoose.model("posts")
  require("./models/Category")
  const Category = mongoose.model("categories")
  const passport = require("passport")
  require("./config/auth")(passport)
  const isAdmin = require("./helpers/isAdmin")
  const db = require("./config/db")

// Config

  //session
    app.use(session({
      secret: "nodecourse",
      resave: true,
      saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

  //Middleware
    app.use((req,res, next) => {
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      res.locals.error = req.flash("error")
      res.locals.user = req.user || null
      res.locals.isAdmin = isAdmin || null
      next()
    })

  // Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

  // Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

  // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb+srv://Glauber:BlogAppNodeJS@blogappnodejs.5rovb.mongodb.net/BlogAppNodeJS?retryWrites=true&w=majority").then(() => {
      console.log('Connected to mongodb');
    }).catch((err) => {
      console.log('Connection failed' + err);
    })

  // Public
    app.use(express.static(path.join(__dirname, '/public')))

  // Routes

    //Routes Posts
      app.get('/', (req, res) => {

        Post.find().populate("category").sort({date: "desc"}).lean().then((posts) => {
          res.render("index", {posts: posts})
        }).catch((err) => {
          req.flash("error_msg", "Internal error")
          res.redirect("/404")
        })

      })

      app.get("/post/:slug", (req,res) => {

        Post.findOne({slug: req.params.slug}).lean().then((post) => {
          if (post) {
            res.render("post/index", {post: post})
          } else {
            req.flash("error_msg", "This post does not exist")
            res.redirect("/")
          }
        }).catch((err) => {
          req.flash("error_msg", "Internal error")
          res.redirect("/")
        })

      })

    //Routes Categories
      app.get('/categories', (req, res) => {

        Category.find().lean().then((categories) => {
          res.render("categories/index", {categories: categories})
        }).catch((err) => {
          req.flash("error_msg", "Internal error loading list of categories")
          res.redirect("/")
        })

      })

      app.get("/categories/:slug", (req, res) => {

        Category.findOne({slug: req.params.slug}).lean().then((category) => {

          if (category) {
            Post.find({category: category._id}).lean().then((posts) => {
              res.render("categories/posts", {posts: posts, category: category})
            }).catch((err) => {
              req.flash("error_msg", "Internal error loading list of posts")
              res.redirect("/")
            })
          } else {
            req.flash("error_msg", "This category does not exist")
            res.redirect("/")
          }

        }).catch((err) => {
          req.flash("error_msg", "Internal error loading page of categories")
          res.redirect("/")
        })

      })

    //Routes Errors
      app.get("/404", (req, res) => {
        res.send('Error 404!')
      })

    //Routes Uses
      app.use('/admin', admin)
      app.use('/users', users)

// Others
  const PORT = process.env.PORT || 8081
  app.listen(PORT, () => {
    console.log("Server working! ");
  })
