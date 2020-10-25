const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


// const db = monk('localhost:27017')
const db = monk(process.env.MONGO_URI)

const mongoCollection = db.get('billCollection');

const schema = Joi.object({
    payMethods: Joi.string().trim().required(),
    productDesc: Joi.string().trim().required(),
    orderNum: Joi.number().required(),
    remark: Joi.string().trim(),
    billCategry: Joi.string().trim().required(),
    createBy: Joi.string().required(),
    createDate: Joi.date().iso().required(),
    updateDate: Joi.date().iso(),
    updateBy: Joi.string(),
    amount: Joi.number().required()
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
        const {pageIndex, pageSize, payMethods} = req.query;
        console.log(pageIndex, pageSize, 'noted::::::::page');
        const skipNum = Number(pageIndex * pageSize);
        const items = await mongoCollection.find({payMethods: payMethods}, {
            limit: Number(pageSize), // 限制一次查询条数
            skip: Number(skipNum) // 跳过多少条数据开始查询
        });
        const total = await mongoCollection.count({payMethods: payMethods});
        res.json({body: items, total: total}) 
    } catch (error) {
        next(error)
    }
})

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
router.post('/queryByMonth', async (req, res, next) => {
    try {
        console.log(req.body, 'noted::::::');
        const {startDay, endDay} = req.body;
        const items = await mongoCollection.find(
            {
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)}
        });
        const amountSum = await mongoCollection.aggregate([
            { $match : { // 筛选条件
                createDate:  {$gte: new Date(startDay), $lte: new Date(endDay)}
              }},
            { $group : { // 按字段求和
            _id : null,
            sum : { $sum : "$amount" }
          }},
          {$project: { // 哪些字段需要展示
            "_id": 1,
            "sum": 1
          }}])
          console.log(amountSum);
        const total = await items.length;
        console.log(total);
        res.json({body: items, total: total, amountSum: amountSum});
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
        await mongoCollection.remove({_id: id });
        res.json({
            message: 'delete Success'
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router;
