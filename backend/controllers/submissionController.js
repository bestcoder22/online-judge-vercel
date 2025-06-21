import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv"

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY});


export const ai_smart_fix = async (req, res) => {
  const { language, code } = req.body;

  // Build prompt as a string, including code fenced block
  const prompt = `You are an expert programmer. Given the following code in ${language}, fix only syntax errors and obvious omissions (like missing semicolons, unbalanced braces or parentheses, missing includes, or missing using namespace std; in C++ if clearly needed). 

- Do NOT invent or guess any variable names, values, or logic.
- If there is at least one safe fixable syntax error or omission, apply only those safe fixes.
- If there is no safe fix needed, or if any error is ambiguous (requires knowing intent or variable meaning), return the code exactly as given, unchanged and indented.
- Only output the corrected (or unchanged) code, properly indented, with no extra text before or after. Do not output any explanations, hints, or messages—just the code itself.
Here is the code:
${code}
Note: Output the code in markdown format
`;

  try{
    const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${prompt}`,
  });

    // Extract the text from the first candidate
    const aiResponse = response.text;
    return res.json({
      success:true,
      code:aiResponse
    });
  } catch(error){
    return res.json({
      success:false,
      error:error.message
    })
  }
  
};

export const ai_complexity = async (req,res) => {
  const {language,code} = req.body;
  const prompt = `Give me the **worst-case** time complexity and **worst-case** space complexity for the following code written in ${language}:

${code}

Instructions:
- Return only the **Big O notation**, nothing else.
- Format the response strictly in **markdown**.
- First line: Time Complexity i.e. O(..)
- Second line: Space Complexity i.e. O(..)
- Be careful with variable **naming cases** — match **uppercase/lowercase letters exactly** as used in the code and bio.`
  try{
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${prompt}`,
    });
    const aiResponse = response.text;
    return res.json({
      success:true,
      complexity:aiResponse
    })
  } catch (error){
    return res.json({
      success:false,
      error:error
    })
  }
}

export const ai_code_review = async (req,res) => {
  const {language,code,problem} = req.body;
  const prompt = `
You are an expert code reviewer. Given the code provided, do the following:

1. Follow below marking scheme strictly for code review.
Code Review Marking Scheme (10 Marks)
1. Time & Space Complexity (4 Marks)

+4: Optimal time & space

-1: Better time possible (e.g., O(n²) vs O(n log n))

-1: Extra space (e.g., unnecessary arrays/maps)

-1: Inefficient loops/logic

2. Correctness & Edge Case Handling (3 Marks)

+3: All cases handled

-1: Misses edge case(s) (e.g., empty, negatives)

-1: Hardcoded assumptions

-1: No input checks

3. Code Quality & Readability (2 Marks)

+2: Clean, modular, readable

-0.5: Poor naming (e.g., a1, x2)

-0.5: No modularity / repeated code

-0.5: Bad indentation

-0.5: Unused vars/imports

4. Comments & Good Practices (1 Mark)

+1: Helpful comments, clean style

-1: No comments in complex logic

-1: Bad coding style

2. From the second line, list what's good about the code.
3. After that, list what can be improved.
4. Use bullet points only, with Markdown formatting.
5. Limit each section (“What's good” and “What can be improved”) to no more than 6-7 bullet points.
6. Do not include any other comments beyond these sections.
7. Each bullet point must be 1-2 lines not more than that.
8. Always bold Score, What's good: and What can be improved:

Begin your review with the score line.  

Below is my code in ${language}:
${code}

Below is problem Statement:
${problem.title}

${problem.description}

${problem.constraints}
`;
  try{
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${prompt}`,
    });
    const aiResponse = response.text;
    return res.json({
      success:true,
      codereview:aiResponse
    })
  } catch (error) {
    return res.json({
      success:false,
      error:error.message
    })
  }
}

export const ai_error_suggestion = async (req,res) => {
  const {language,code,problem,errorType,message} = req.body;
  const prompt = `You are an expert debugging assistant. Given the following:

• Problem title: ${problem.title}

• Description: ${problem.description}

• Constraints: ${problem.constraints}

• Language: ${language}

• Error type: ${errorType}

• Error message: ${message}

• Language: ${language}

• Code: ${code}

Provide **only two bullet points** in markdown:
1. Why this error is occurring in the code.
2. Exactly what the user should do to resolve it.

Keep each point very short and focused—no extra commentary.`;
try{
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `${prompt}`,
  });
  const aiResponse = response.text;
  return res.json({
    success:true,
    suggestion:aiResponse
  })
}
catch (error) {
  return res.json({
      success:false,
      error:error.message
    })
}
}