const crypto = require('crypto');
const validator = require('validator');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is Required'] },
    email: {
      type: String,
      required: [true, 'Email is Required'],
      unique: [true, 'This Email is already in Use'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid Email Address'],
    },
    photo: {
      type: String,
    },
    role: {
      type: 'string',
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Password is Required'],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm Password is Required'],
      validate: {
        // custom validator only works on create or save
        validator: function (el) {
          return this.password === el;
        },
        message: 'Password and Confirm password are not same',
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: { type: Date },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual populate
userSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'user',
  localField: '_id',
});

/* userSchema.pre('save', function (next) {
  if (this.password !== this.passwordConfirm) {
    next(new AppError('Password and Confirm password are not same'));
  }
  next();
}); */

userSchema.pre('save', async function (next) {
  // run this if password is actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  // this.passwordChangedAt = Date.now();

  next();
});

// sometime JWT issue or create faster than saving a document, which prevent user from loggin to account that why we use 1second minus
userSchema.pre('save', async function (next) {
  // run this if password is actually modified
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

//instance method
userSchema.methods.correctPassword = async function (inputPass, userPass) {
  return await bcrypt.compare(inputPass, userPass);
};

userSchema.methods.changesPasswordAfter = function (JWTCreationTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return changedTimestamp > JWTCreationTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
