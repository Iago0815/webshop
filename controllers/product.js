
const formidable = require('formidable');
const _ = require("lodash");
const fs = require('fs');
const Product = require("../models/product");
const { errorHandler } = require('../helpers/dbErrorHandlers');
const { findById } = require('../models/product');
const { nextTick } = require('process');
const product = require('../models/product');


exports.productById = (req,res,next,id) => {

  Product.findById(id).exec((err, product) => {

    if(err || !product) {
     
            return res.status(400).json({

                error: 'Product not found'
            })          
    }

    req.product = product
    next();

  });
};

exports.read = (req,res) => {

  req.product.photo = undefined;
  return res.json(req.product);

}


exports.create = (req,res) => {
 
    //--> browser sends multipart form data in chunks
    // problem: data can exhaust memory
    // FORMIDABLE:
    // parse req object and receive fields (form) and files

    let form = new formidable.IncomingForm();

    form.keepExtensions = true;

    form.parse(req,(err, fields, files) => {

        if(err) {

            return res.status(400).json({

                error: 'Image could not be uploaded'
            })
        }

        
        const {name,description,price,category,quantity,shipping} = fields

        //check for all fields of product
        if(!name || !description || !price || !category || !quantity || !shipping) {

          return res.status(400).json({

            error:"All fields are required"
          });
        }

        let product = new Product(fields)

        if(files.photo) {
           
           // console.log("FILES PHOTO: ", files.photo);

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }

      // readFileSync
      // returns the content of the file
      // path (files.photo.filepath) : it takes the relative path of the file  
      product.photo.data = fs.readFileSync(files.photo.filepath);
      
      // change typt to mimetype
      product.photo.contentType = files.photo.mimetype; 
            
        }

        product.save((err,result) => {

              if(err) {

            return res.status(400).json({

                error: errorHandler(err)
            })
        }

        res.json(result);


        });

    });

};

exports.remove = (req,res) => {

  let product = req.product;

  product.remove((err) => {

       if(err) {

            return res.status(400).json({

                error: errorHandler(err)
            });
  }

  res.json({

     
      message: "Product deleted successfully"
  })
})

}

exports.update = (req,res) => {

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req,(err, fields, files) => {

        if(err) {

            return res.status(400).json({

                error: 'Image could not be uploaded'
            })
        }

        //check for all fields
        const {name,description,price,category,quantity,shipping} = fields

        if(!name || !description || !price || !category || !quantity || !shipping) {

          return res.status(400).json({

            error:"All fields are required"
          });
        }

        let product = req.product;
        product = _.extend(product,fields)

        if(files.photo) {
           
           //  console.log("FILES PHOTO: ", files.photo);

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1mb in size",
        });
      }

      // change path to filepath
      product.photo.data = fs.readFileSync(files.photo.filepath);
      
      // change typt to mimetype
      product.photo.contentType = files.photo.mimetype; 
            
        }

        product.save((err,result) => {

              if(err) {

            return res.status(400).json({

                error: errorHandler(err)
            })
        }

        res.json(result);


        });

    });

};

/**
 *   sell/ arrival
 *   by sell
 *   by arrival
 *   if no params are sent
 * 
 */


exports.list = (req, res) => {

  let order = req.query.order ? req.query.order : 'asc'
   let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limt ? parseInt(req.query.limit) : 6


    Product.find()
       .select("-photo")
       .populate('category')
       .sort([[sortBy, order]])
       .limit(limit)
       .exec((err, products)=> {
             if(err) {
              return res.status(400).json({

                error: "Products not found"
              });
             }
          res.json(products);

       })

}

/**
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 * 
 */

exports.listRelated = (req,res) => {

  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find({_id: {$ne: req.product}, category: req.product.category })
  .limit(limit)
  .populate('category', '_id name')
  .exec((err, products)=> {
             if(err) {
              return res.status(400).json({

                error: "Products not found"
              });
             }
          res.json(products);
  })

}

exports.listCategories = (req,res) => {

     Product.distinct("category", {},  (err, categories) => {

       if(err) {
             
              return res.status(400).json({

                error: "Categories not found"
              });
             }
          res.json(categories);
  })

}

exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req,res,next) => {

    if(req.product.photo.data) {

      res.set('Content-Type', req.product.photo.contentType);

      return res.send(req.product.photo.data)
    }

    next();

};