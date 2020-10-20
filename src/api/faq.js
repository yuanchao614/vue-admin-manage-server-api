const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


const db = monk('localhost:27017')
const faqs = db.get('faqs')

const schema = Joi.object({
    question: Joi.string().trim().required(),
    answer: Joi.string().trim().required(),
    video_url: Joi.string().uri()
});

const router = express.Router();

/**
 * get all
 * http://localhost:5000/api/v1/faq?pageIndex=0&pageSize=10
 * ?pageIndex=0&pageSize=10参数使用req.query获取参数
 */
router.get('/', async (req, res, next) => {
    try {
        const {pageIndex, pageSize} = req.query;
        console.log(pageIndex, pageSize, 'noted::::::::page');
        const skipNum = Number(pageIndex * pageSize);
        const items = await faqs.find({}, {
            limit: Number(pageSize), // 限制一次查询条数
            skip: Number(skipNum) // 跳过多少条数据开始查询
        });
        res.json(items) 
    } catch (error) {
        next(error)
    }
})

// get one
/**
 * http://localhost:5000/api/v1/faq/5f8d50e24ce0b939dcc629ec
 * /:id 参数使用 req.params 获取
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await faqs.findOne({
            _id: id,
        });
        if (!item) return next();
        return res.json(item);
    } catch (error) {
        next(error)
    }
})

// create one
router.post('/', async (req, res, next) => {
    try {
        console.log(req, 'noted::::::');
        console.log(req.body, 'noted::::::');
        const value = await schema.validateAsync(req.body);
        const inserted = await faqs.insert(value);
        console.log(res, 'abc');
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
        const item = await faqs.findOne({
            _id: id,
        });
        if (!item) return next();
        await faqs.update({
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
        await faqs.remove({_id: id });
        res.json({
            message: 'Success'
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router;
