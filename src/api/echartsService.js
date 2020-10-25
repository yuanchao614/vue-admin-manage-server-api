const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


// const db = monk('localhost:27017')
const db = monk(process.env.MONGO_URI)

const mongoCollection = db.get('billCollection');


const isoDate = () => {
    const nowDate = new Date();
    return nowDate.setHours(nowDate.getHours(), nowDate.getMinutes() - nowDate.getTimezoneOffset());
}

const router = express.Router();



// get today Data
router.get('/today', async (req, res, next) => {
    try {
        const items = await mongoCollection.find(
            {
                createDate:  {$gt: new Date('2020-10-18'), $lt: new Date('2020-10-19')}
        });
        res.json(items) 
    } catch (error) {
        next(error)
    }
})

// query by moth
router.post('/queryAmontByPayMethods', async (req, res, next) => {
    try {
        console.log(req.body, 'noted::::::');
        const {startDay, endDay, payMethods} = req.body;
        const wechatAmountSum = await mongoCollection.aggregate([
            { $match : { // 筛选条件
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)},
                payMethods: '微信'
              }},
            { $group : { // 按字段求和
            _id : 'wechat',
            sum : { $sum : "$amount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);

          const zfbAmountSum = await mongoCollection.aggregate([
            { $match : { // 筛选条件
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)},
                payMethods: '支付宝'
              }},
            { $group : { // 按字段求和
            _id : 'zfb',
            sum : { $sum : "$amount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}])

          const cachAmountSum = await mongoCollection.aggregate([
            { $match : { // 筛选条件
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)},
                payMethods: '现金'
              }},
            { $group : { // 按字段求和
            _id : 'cach',
            sum : { $sum : "$amount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}])
        res.json({body: {wechatAmountSum, zfbAmountSum, cachAmountSum}});
    } catch (error) {
        next(error)
    }
})


module.exports = router;
