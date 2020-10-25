const express = require('express');

const emojis = require('./emojis');

const faq = require('./faq')

const userService = require('./userService');

const billService = require('./billService')
const echartsService = require('./echartsService')


const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.post('/', (req, res) => {
  console.log(req.body, 'noted000000');
  res.json(['😀', '😳', '🙄']);
});


router.use('/emojis', emojis);

router.use('/faq', faq);

router.use('/userService', userService)

router.use('/billService', billService)
router.use('/echartsService', echartsService)



module.exports = router;
