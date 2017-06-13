/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

/**
 * GET /
 * Login page.
 */
exports.getLogin = (req, res) => {
  res.render('login', {
    title: 'Login'
  });
};
