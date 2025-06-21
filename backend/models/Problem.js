import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema({
  problemid: {
    type: Number,
    required: true,
    unique: true,
  },
  tag: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  constraints: {
    type: String,
    required: true,
  },
  sampleCases: [
    {
      id: { type: Number },
      sampleInput: { type: String, required: true },
      sampleOutput: { type: String, required: true },
    },
  ]
  
});

const Problem = mongoose.model('Problem', ProblemSchema);

export default Problem;