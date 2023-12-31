const express = require("express");
const router = express.Router();

const { create,productById,read,remove,update,list,listRelated,listCategories,listBySearch, photo } = require("../controllers/product");
const { requireSignin,isAuth,isAdmin } = require("../controllers/auth");
const { userById} = require("../controllers/user");

router.get("/product/:productId",read)
router.post("/product/create/:userId",requireSignin,isAdmin,isAuth,create);

router.delete("/product/:productId/:userId",requireSignin,isAdmin,isAuth,remove)

router.put("/product/:productId/:userId",requireSignin,isAdmin,isAuth,update)

router.get("/products", list)
router.get("products/related/:productId",listRelated)
router.get("/products/categories", listCategories)
router.post("/products/by/search", listBySearch);
router.get("/product/photo/:productId", photo)

router.param("userId",userById);

/**
 * anythime there is a product id in the route parameter, the method
 * productById runs and makes the product available in the req object
 *  */ 

router.param("productId",productById);

module.exports = router;
     