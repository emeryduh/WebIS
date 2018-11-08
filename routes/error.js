const express = require('express');
const router = express.Router();

// Render error
router.get('/', function(req, res) {
  res.render('error');
});

module.exports = router;
