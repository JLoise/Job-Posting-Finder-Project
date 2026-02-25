import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const experienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
}, { _id: true });

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  field: String,
  startDate: String,
  endDate: String,
  description: String,
}, { _id: true });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: false, minlength: 6 },
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String, default: '' },
    headline: { type: String, default: '' },
    about: { type: String, default: '' },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
