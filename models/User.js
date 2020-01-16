const Mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Key = require('../config/keys');

const userSchema = new Mongoose.Schema({
    email: {
        type: String,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        required:true,
        default:Date.now()
    },
    updated_at: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

})

userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

// Generating authentication token
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
        _id: this._id,
        email: this.email
    },
        Key.jsonWebTokenKey,
        { expiresIn: '30d' }
        );
    return token;
}
// Hashing Password.
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10, (err, hash) => {
        console.log(hash)
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});

// compare password with a hashed one
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = Mongoose.model('user', userSchema);