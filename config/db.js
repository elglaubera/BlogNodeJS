if (process.env.NODE_ENV == "production") {
  module.exports = {mongoURI:"mongodb+srv://Glauber:BlogAppNodeJS@blogappnodejs.5rovb.mongodb.net/BlogAppNodeJS?retryWrites=true&w=majority"}
} else {
  module.exports = {mongoURI:"mongodb://localhost/blogapp"}
}