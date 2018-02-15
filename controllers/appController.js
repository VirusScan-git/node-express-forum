const mongoose = require('mongoose');

const Post = mongoose.model('Post');

/*
Function to handle the Index Route
*/
exports.getIndexPage = async (req, res) => {
  // CHeck page number from the params sent in the url or set to 1
  const page = req.params.page || 1;
  // SET LIMIT OF number of posts to return
  const limit = 5;
  // SET THE NUMBER OF POSTS TO SKIP BASED ON PAGE NUMBER
  const skip = (page * limit) - limit;
  // Query the Database for all the Posts in the DB
  const postsPromise = await Post.find().sort({ created: -1 }).populate('author').skip(skip)
    .limit(limit);
  const countPromise = await Post.count();
  const [posts, count] = await Promise.all([postsPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!posts.length && skip) {
    res.redirect(`/posts/page/${pages}`);
  } else {
    res.render('index', {
      title: 'Home Page', posts, page, pages, count,
    });
  }
};


/*
Function to handle the get Add Post Page
*/
exports.getaddPostPage = async (req, res) => {
  res.render('addPost', { title: 'Add New Post' });
};

/*
Function to add new Post
*/
exports.newPost = async (req, res) => {
  req.body.author = req.user._id;
  const post = await (new Post(req.body)).save();
  req.flash('success', `Successfully Created ${post.title}.`);
  res.redirect(`/post/${post.slug}`);
};


/*
Controller to get post by slug
*/
exports.getPostBySlug = async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('author comments');
  if (!post) {
    res.redirect('/error'); // Send them to 404 page!
    return;
  }
  res.render('post', { title: post.title, post });
};

