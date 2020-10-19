const express = require('express');
const monk = require('monk');
const Joi = require('@hapi/joi');
const { json } = require('express');


const db = monk(process.env.MONGO_URI)
const mongoCollection = db.get('userCollection');

const schema = Joi.object({
    userId: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
    phoneNo: Joi.number().required(),
    email: Joi.string().required(),
    createDate: Joi.date().iso(),
    createBy: Joi.string(),
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
        const items = await mongoCollection.find({});
        res.json(items) 
    } catch (error) {
        next(error)
    }
})

// get one
router.get('/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(userId, 'noted:::');
        const item = await mongoCollection.findOne({
            userId: userId,
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
        // console.log(req, 'noted::::::');
        console.log(req.body, 'noted::::::');
        const value = await schema.validateAsync(req.body);
        // console.log(mongoCollection.userCollection, 'noted::::::');
        const inserted = await mongoCollection.insert(value);
        // console.log(res, 'abc');
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
        await mongoCollection.remove({_id: id });
        res.json({
            message: 'Success'
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router;
