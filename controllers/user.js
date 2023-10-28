const User = require('../models/user')

// everytime there is a user id in the route, this method will run automatically and
// make the user available in the request object
//

exports.userById = (req,res,next,id) => {

    User.findById(id).exec((err,user) => {

            if(err || !user) {
                return res.status(400).json({
                    error:'User not found'
                })
            }

        //add user infromation to the req object    
        req.profile = user;

        //next because this is a middleware
        next();       
});
}

exports.read = (req,res) => {

        req.profile.hashed_password = undefined
        req.profile.salt = undefined

        return res.json(req.profile);
}

exports.update = (req,res) => {
    

    User.findOneAndUpdate(   

        {_id: req.profile._id}, 
        {$set: req.body}, 
        {new: true}, 
        (err,user) => {

            if(err) {
            return res.status(400).json({

                error: "You are not athorized to perform this action"   
            })

        }
             user.hashed_password = undefined;
             user.salt = undefined;
           
             res.json(user);

        }  
     )
}