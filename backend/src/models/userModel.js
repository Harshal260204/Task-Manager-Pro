import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't return password hash by default
    },
  },
  {
    timestamps: true,
  }
)

// Index on email for faster lookups (unique index is automatically created)
userSchema.index({ email: 1 })

const User = mongoose.model('User', userSchema)

export default User

