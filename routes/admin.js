const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Category")
const Category = mongoose.model("categories")
require("../models/Post")
const Post = mongoose.model("posts")
const {isAdmin} = require("../helpers/isAdmin")

//------------------------------------------------------------------

router.get('/', isAdmin, (req, res) => {
  res.render("admin/index")
})

//------------------------------------------------------------------

router.get('/categories', isAdmin, (req, res) => {

  Category.find().sort({date: 'desc'}).lean().then((categories) => {
    res.render("admin/categories", {categories: categories})
  }).catch((err) => {
    req.flash("error_msg", "Error listing the categories")
    res.redirect("/admin")
  })

})

router.get('/categories/add', isAdmin, (req, res) => {
  res.render("admin/addcategories")
})

//------------------------------------------------------------------

router.get("/categories/edit/:id", isAdmin, (req, res) => {
  Category.findOne({_id:req.params.id}).lean().then((category) => {
      res.render("admin/editCategories", {category: category})
  }).catch((err) => {
    req.flash("error_msg", "This category is not exist")
    res.redirect("/admin/categories")
  })
})

//------------------------------------------------------------------

router.post('/categories/new', isAdmin, (req, res) => {

  var errors =[]

  if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
    errors.push({text: "Invalid Name"})
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    errors.push({text: "Invalid Slug"})
  }

  if (req.body.name.length < 2) {
    errors.push({text: "Name of category very small"})
  }

  if (errors.length > 0) {
    res.render("admin/addcategories", {errors: errors})
  }else {
    const newCategory = {
      name: req.body.name,
      slug: req.body.slug
    }
    new Category(newCategory).save().then(() => {
      req.flash("success_msg", "Successfully created category")
      res.redirect("/admin/categories")
    }).catch((err) => {
      req.flash("error_msg", "Error creating category, try again")
      res.redirect("/admin")
    })
  }

})

//------------------------------------------------------------------

router.post("/categories/edit", isAdmin, (req, res) => {

  Category.findOne({_id: req.body.id}).then((category) => {
    category.name = req.body.name
    category.slug = req.body.slug

    category.save().then(() => {
      req.flash("success_msg", "Successfully edited category")
      res.redirect("/admin/categories")
    }).catch((err) => {
      req.flash("error_msg", "Error saving category edit, try again")
      res.redirect("/admin/categories")
    })

  }).catch((err) => {
    req.flash("error_msg", "Error editing category, try again")
    res.redirect("/admin/categories")
  })

})

//------------------------------------------------------------------

router.post("/categories/delete", isAdmin, (req, res) => {

  Category.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Successfully deleted category")
    res.redirect("/admin/categories")
  }).catch((err) => {
    req.flash("error_msg", "Error deleting category, try again")
    res.redirect("/admin/categories")
  })

})

//------------------------------------------------------------------

router.get('/posts', isAdmin, (req, res) => {

    Post.find().sort({date: 'desc'}).lean().populate("category").then((posts) => {
      res.render("admin/posts", {posts: posts})
    }).catch((err) => {
      req.flash("error_msg", "Error listing the posts")
      res.redirect("/admin")
    })

})

//------------------------------------------------------------------

router.get('/posts/add', isAdmin, (req, res) => {

    Category.find().lean().then((categories) => {
      res.render("admin/addposts", {categories: categories})
    }).catch((err) => {
      req.flash("error_msg", "Error loading form, try again")
      res.redirect("/admin")
    })

})

//------------------------------------------------------------------

router.post('/posts/new', isAdmin, (req, res) => {

    var errors = []

    if (req.body.category == "0") {
      errors.push({text: "Category invalid, register a category"})
    }

    if (errors.length > 0) {
      res.render("admin/addposts", {errors: errors})
    }else{
      const newPost = {
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        contents: req.body.contents,
        category: req.body.category
      }

      new Post(newPost).save().then(() => {
          req.flash("success_msg", "Successfully created post")
          res.redirect("/admin/posts")
      }).catch((err) => {
          req.flash("error_msg", "Error creating post, try again")
          res.redirect("/admin")
      })
    }

})

//------------------------------------------------------------------

router.get("/posts/edit/:id", isAdmin, (req, res) => {

  Post.findOne({_id:req.params.id}).lean().then((post) => {

    Category.find().lean().then((categories) => {
      res.render("admin/editPost", {categories: categories, post: post})
    }).catch((err) => {
      req.flash("error_msg", "Error loading category or post, try again")
      res.redirect("/admin/posts")
    })

  }).catch((err) => {
    req.flash("error_msg", "This post is not exist")
    res.redirect("/admin/posts")
  })

})

//------------------------------------------------------------------

router.post("/posts/edit", isAdmin, (req, res) => {

  Post.findOne({_id: req.body.id}).then((post) => {

    post.title = req.body.title
    post.slug = req.body.slug
    post.description = req.body.description
    post.contents = req.body.contents
    post.category = req.body.category

    post.save().then(() => {
      req.flash("success_msg", "Successfully edited post")
      res.redirect("/admin/posts")
    }).catch((err) => {
      req.flash("error_msg", "Error saving post edit, try again")
      res.redirect("/admin/posts")
    })

  }).catch((err) => {
    req.flash("error_msg", "Error editing post, try again")
    res.redirect("/admin/posts")
  })

})

//------------------------------------------------------------------

router.post("/posts/delete", isAdmin, (req, res) => {

  Post.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Successfully deleted post")
    res.redirect("/admin/posts")
  }).catch((err) => {
    req.flash("error_msg", "Error deleting post, try again")
    res.redirect("/admin/posts")
  })

})

//------------------------------------------------------------------

//Other method of delete

  //router.get("/posts/delete/:id", (req, res) => {
    //Post.remove({id: req.params.id}).then(() => {
    //req.flash("success_msg", "Successfully deleted post")
    //res.redirect("/admin/posts")
      //}).catch((err) => {
        //req.flash("error_msg", "Error deleting post, try again")
        //res.redirect("/admin/posts")
      //})
  //})

//------------------------------------------------------------------

module.exports = router
