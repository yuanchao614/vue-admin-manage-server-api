const express = require("express");
const monk = require("monk");
const Joi = require("@hapi/joi");
const db = monk(process.env.MONGO_URI);
const mongoCollection = db.get("userCollection");

const schema = Joi.object({
    userId: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
    phoneNo: Joi.number().required(),
    email: Joi.string().required(),
    createDate: Joi.date().iso(),
    createBy: Joi.string(),
    updateDate: Joi.date().iso(),
    updateBy: Joi.string(),
});

const schemaLogin = Joi.object({
    userId: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
});

const isoDate = () => {
    const nowDate = new Date();
    return nowDate.setHours(
        nowDate.getHours(),
        nowDate.getMinutes() - nowDate.getTimezoneOffset()
    );
};

const router = express.Router();

// get all
router.get("/", async (req, res, next) => {
    try {
        // console.log(req, 'noted:::::::::::');
        const {
            pageIndex,
            pageSize
        } = req.query;
        console.log(pageIndex, pageSize, "noted::::::::page");
        const skipNum = Number(pageIndex * pageSize);
        const items = await mongoCollection.find({}, {
            limit: Number(pageSize), // 限制一次查询条数
            skip: Number(skipNum), // 跳过多少条数据开始查询
        });
        const total = await mongoCollection.count();
        res.json({
            body: items,
            total: total
        });
    } catch (error) {
        next(error);
    }
});

// get one
router.get("/:userId", async (req, res, next) => {
    try {
        const {
            userId
        } = req.params;
        console.log(userId, "noted:::");
        const item = await mongoCollection.findOne({
            userId: userId,
        });
        console.log(item, "noted:::::::");
        if (!item) return next({});
        return res.json(item);
    } catch (error) {
        next(error);
    }
});

// query by moth
router.post("/queryByMonth", async (req, res, next) => {
    try {
        console.log(req.body, "noted::::::");
        const {
            startDay,
            endDay
        } = req.body;
        const items = await mongoCollection.find({
            createDate: {
                $gte: new Date(startDay),
                $lte: new Date(endDay)
            },
        });
        const total = await items.length;
        console.log(total);
        res.json({
            body: items,
            total: total
        });
    } catch (error) {
        next(error);
    }
});

// create one
router.post("/", async (req, res, next) => {
    try {
        // console.log(req, 'noted::::::');
        console.log(req.body, "noted::::::");
        const value = await schema.validateAsync(req.body);
        // console.log(mongoCollection.userCollection, 'noted::::::');
        const inserted = await mongoCollection.insert(value);
        // console.log(res, 'abc');
        res.json(inserted);
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        // console.log(req, 'noted::::::');
        console.log(req.body, "noted::::::");
        const {
            userId,
            password
        } = await schemaLogin.validateAsync(req.body);
        // console.log(mongoCollection.userCollection, 'noted::::::');
        const result = await mongoCollection.findOne({
            userId: userId,
            password: password,
        });
        // console.log(res, 'abc');
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// update one
router.put("/:id", async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        const value = await schema.validateAsync(req.body);
        const item = await mongoCollection.findOne({
            _id: id,
        });
        if (!item) return next();
        await mongoCollection.update({
            _id: id,
        }, {
            $set: value,
        });
        res.json(value);
    } catch (error) {
        next(error);
    }
});

// delete one
router.delete("/:id", async (req, res, next) => {
    try {
        const {
            id
        } = req.params;
        await mongoCollection.remove({
            _id: id
        });
        res.json({
            message: "Success",
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;