const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


// const db = monk('localhost:27017')
const db = monk(process.env.MONGO_URI)

const mongoCollection = db.get('toDoCollection');

const schema = Joi.object({
    createBy: Joi.string().required(),
    createDate: Joi.date().iso().required(),
    updateDate: Joi.date().iso(),
    updateBy: Joi.string(),
    dates: Joi.date().iso().required(),
    description: Joi.string().required(),
    isComplete: Joi.boolean(),
    color: Joi.string().required(),
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
            limit: Number(pageSize), // 限制一次查询条数
            skip: Number(skipNum) // 跳过多少条数据开始查询
        });
        const total = await mongoCollection.count({});
        res.json({body: items, total: total}) 
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