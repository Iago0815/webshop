const express = require("express");
const router = express.Router();

const { requireSignin,isAuth,isAdmin } = require("../controllers/auth");

const { userById,read,update } = require("../controllers/user");

router.get('/secret/:userId',requireSignin,isAuth,isAdmin, (req,res) => {

    //base on the userid we will repond with the user information
    res.json({

        user:req.profile
    });
})

router.get("/user/:userId", requireSignin, isAuth, read)
router.put("/put/:userId", requireSignin, isAuth, update)

//any time there is a parameter called userId in the route we want to execute the userById method (user.js controllers)

router.param('userId',userById)

module.exports = router;
