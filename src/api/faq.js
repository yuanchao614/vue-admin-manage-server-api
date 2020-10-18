const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


const db = monk(process.env.MONGO_URI)
const faqs = db.get('faqs')

const schema = Joi.object({
    question: Joi.string().trim().required(),
    answer: Joi.string().trim().required(),
    video_url: Joi.string().uri()
});

const router = express.Router();

// get all
router.get('/', async (req, res, next) => {
    try {
        console.log(req, 'noted:::::::::::');
        const items = await faqs.find({});
        res.json(items) 
    } catch (error) {
        next(error)
    }
    res.json({
        message: 'Hello Read all'
    })
})

// get one
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
            $set: {
                value,
            }
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
