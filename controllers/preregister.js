/**
 * Sign up render
 */
module.exports.getPreRegister = (req, res) => {
  res.render('preregister', {
    title: 'Pre-Registration',
    step: (req.params && req.params.step) ? req.params.step : 0
  });
};
