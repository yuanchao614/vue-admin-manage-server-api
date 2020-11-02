const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


// const db = monk('localhost:27017')
const db = monk(process.env.MONGO_URI)

const mongoCollection = db.get('incomeCollection');

const schema = Joi.object({
    incomePlatform: Joi.string().trim().required(), // 收入平台 支付宝/微信/现金/银行卡
    // orderNum: Joi.number().required(),
    remark: Joi.string().trim(),
    incomeCategry: Joi.string().trim().required(),
    incomeAmount: Joi.number().required(),
    createBy: Joi.string().required(),
    createDate: Joi.date().iso().required(),
    updateDate: Joi.date().iso(),
    updateBy: Joi.string()
});

const isoDate = () => {
    const nowDate = new Date();
    return nowDate.setHours(nowDate.getHours(), nowDate.getMinutes() - nowDate.getTimezoneOffset());
}

const router = express.Router();

// get all
router.get('/', async (req, res, next) => {
    try {
        // console.log(req, 'noted:::::::::::');
        const { pageIndex, pageSize } = req.query;
        console.log(pageIndex, pageSize, 'noted::::::::page');
        const skipNum = Number(pageIndex * pageSize);
        const items = await mongoCollection.find({}, {
            sort: {createDate: 1},
            limit: Number(pageSize), // 限制一次查询条数
            skip: Number(skipNum) // 跳过多少条数据开始查询
        });
        res.json(items)
    } catch (error) {
        next(error)
    }
})


router.post('/queryByMonth', async (req, res, next) => {
    try {
        console.log(req.body, 'noted::::::');
        const {startDay, endDay} = req.body;
        const items = await mongoCollection.find(
            {
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)}
        });
        const amountSum = await mongoCollection.aggregate([ // 本月总收入
            { $match : { // 筛选条件
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)}
              }},
            { $group : { // 按字段求和
            _id : null,
            sum : { $sum : "$incomeAmount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);
        const wagesAmount = await mongoCollection.aggregate([ // 本月工资总收入
            { $match : { // 筛选条件
                incomeCategry:  "工资"
              }},
            { $group : { // 按字段求和
            _id : "wagesAmount",
            sum : { $sum : "$incomeAmount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);

          const mangeAmount = await mongoCollection.aggregate([ // 本月理财总收入
            { $match : { // 筛选条件
                incomeCategry:  "理财"
              }},
            { $group : { // 按字段求和
            _id : "mangeAmount",
            sum : { $sum : "$incomeAmount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);

          const profitAmount = await mongoCollection.aggregate([ // 本月收益总收入
            { $match : { // 筛选条件
                incomeCategry:  "收益"
              }},
            { $group : { // 按字段求和
            _id : "profitAmount",
            sum : { $sum : "$incomeAmount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);

          const redAmount = await mongoCollection.aggregate([ // 本月红包总收入
            { $match : { // 筛选条件
                incomeCategry:  "红包"
              }},
            { $group : { // 按字段求和
            _id : "redAmount",
            sum : { $sum : "$incomeAmount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);

          const transferAmount = await mongoCollection.aggregate([ // 本月转账总收入
            { $match : { // 筛选条件
                incomeCategry:  "转账"
              }},
            { $group : { // 按字段求和
            _id : "transferAmount",
            sum : { $sum : "$incomeAmount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}]);
          console.log(amountSum);
        const total = await items.length;
        console.log(total);
        res.json({body: {
            wagesAmount,
            mangeAmount,
            profitAmount,
            redAmount,
            transferAmount
        }, total: total, amountSum: amountSum});
    } catch (error) {
        next(error)
    }
})

// get today Data
router.get('/today', async (req, res, next) => {
    try {
        const items = await mongoCollection.find(
            {
                createDate: { $gt: new Date('2020-10-18'), $lt: new Date('2020-10-19') }
            });
        res.json(items)
    } catch (error) {
        next(error)
    }
})


// get one
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await mongoCollection.findOne({
            _id: id,
        });
        console.log(item, 'noted:::::::');
        if (!item) return next({});
        return res.json(item);
    } catch (error) {
        next(error)
    }
})

// create one
router.post('/', async (req, res, next) => {
    try {
        console.log(req.body, 'noted::::::');
        const value = await schema.validateAsync(req.body);
        const inserted = await mongoCollection.insert(value);
        res.json(inserted);
    } catch (error) {
        next(error)
    }
})

// update one
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const value = await schema.validateAsync(req.body);
        const item = await mongoCollection.findOne({
            _id: id,
        });
        if (!item) return next();
        await mongoCollection.update({
            _id: id,
        }, {
            $set: value
        });
        res.json(value);
    } catch (error) {
        next(error)
    }
})

// delete one
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await mongoCollection.remove({ _id: id });
        res.json({
            message: 'delete Success'
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router;
