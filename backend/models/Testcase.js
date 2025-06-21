import mongoose from "mongoose";

const TestcaseSchema = new mongoose.Schema({
  problemid: {
    type: Number,
    required: true,
    unique: true,
  },
  input: [
    {
      name: { type: String },
      data: { type: String, required: true },
    }
  ],
  expectedOutput: [
    {
      name: { type: String },
      data: { type: String, required: true },
    }
  ],
  visibility: {
    type: Boolean,
    default: true,
  }
});

const Testcase = mongoose.model('Testcase', TestcaseSchema);

export default Testcase;
