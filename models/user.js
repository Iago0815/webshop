const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxLength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: 32,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      trim: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    history: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// virtual fields, uuid required

/*You can also use virtuals to set multiple properties at once as an alternative to custom setters on normal properties. For example, suppose you have two string properties: firstName and lastName. You can create a virtual property fullName that lets you set both of these properties at once. The key detail is that, in virtual getters and setters, this refers to the document the virtual is attached to.
*/



userSchema
/* we will be sending password from the client side*/ 
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//methods  

userSchema.methods = {

  authenticate: function(plainText)  {
      return this.encryptPassword(plainText) === this.hashed_password;

  },

  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

/* we use mongoose.model function to create a new model, based on userSchema*/

module.exports = mongoose.model("User", userSchema);
