import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Job from './models/Job.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loyseconnect';

const sampleJobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechFlow Inc',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salaryMin: 120000,
    salaryMax: 160000,
    description: 'We are looking for an experienced frontend developer to build responsive web applications with React. You will work with design and backend teams to deliver great user experiences. 4+ years of experience with modern JavaScript and React required.',
  },
  {
    title: 'Backend Developer',
    company: 'DataDrive',
    location: 'New York, NY',
    type: 'Full-time',
    salaryMin: 110000,
    salaryMax: 145000,
    description: 'Join our platform team to design and maintain APIs and services. Strong experience with Node.js, MongoDB, and REST APIs. Knowledge of cloud services (AWS or GCP) is a plus.',
  },
  {
    title: 'Junior Developer',
    company: 'StartupLab',
    location: 'Austin, TX',
    type: 'Full-time',
    salaryMin: 65000,
    salaryMax: 85000,
    description: 'Great opportunity for someone with 0–2 years of experience. You will work on full-stack features using our MERN stack. We offer mentorship and growth. Bootcamp grads welcome.',
  },
  {
    title: 'React Developer (Contract)',
    company: 'Agency One',
    location: 'Remote',
    type: 'Contract',
    salaryMin: 70,
    salaryMax: 90,
    description: '6-month contract to build a client dashboard in React. Remote work, flexible hours. Experience with TypeScript and state management preferred. Rate is hourly ($70–90/hr).',
  },
  {
    title: 'Full Stack Developer',
    company: 'BuildCo',
    location: 'Denver, CO',
    type: 'Full-time',
    salaryMin: 95000,
    salaryMax: 125000,
    description: 'Full stack role working on our product suite: React frontend and Node/Express API with MongoDB. We value clean code, testing, and collaboration. Benefits and remote-friendly.',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: 'seed@loyseconnect.example.com' });
    if (!user) {
      user = await User.create({
        name: 'Seed User',
        email: 'seed@loyseconnect.example.com',
        password: 'seedpassword123',
      });
      console.log('Created seed user:', user.email);
    } else {
      console.log('Using existing seed user:', user.email);
    }

    const existingCount = await Job.countDocuments({ postedBy: user._id });
    if (existingCount >= 5) {
      console.log('Sample jobs already exist. Exiting. (Delete some jobs from DB to re-seed.)');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    for (const job of sampleJobs) {
      await Job.create({
        ...job,
        postedBy: user._id,
      });
    }
    console.log('Inserted 5 sample jobs.');

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
