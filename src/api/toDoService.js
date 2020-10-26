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

module.exports = router;