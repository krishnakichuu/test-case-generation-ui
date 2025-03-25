import ollama from "ollama";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import {GoogleGenerativeAI} from "@google/generative-ai";



globalThis.fetch = fetch; // Ensure fetch works in Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export async function generateTestFile(componentPath:string, componentCode:string) {
  //TODO: idea of getting the testing frame work as a parameter trough CLI ??!
  const componentName = path.basename(componentPath, ".tsx");
  const firstPrompt = `
  You are an AI agent that specializes in automated test code generation. Your job is to generate a Jest test suite for the given React component using React Testing Library, ensuring high-quality, intuitive, and ready-to-run test code. Your role is to automate my test writing process, saving me time and effort while producing effective and reliable test cases.
  ## **Rules:**
  1️⃣ **Output only runnable Jest test code, formatted for ${componentName}.test.js.**  
  2️⃣ **No explanations, comments, or additional text before or after the code.**  
  4️⃣ **Begin the output directly with import statements.**  
  5️⃣ **Ensure all necessary imports (@testing-library/react, user-event, react, and jest.mock for Axios if applicable).**  
  
  ## **Test Coverage:**
  ✅ Component renders without errors (Smoke test).  
  ✅ Presence of expected elements (Use getByRole for headings, buttons, etc., and getByText for other elements).
  ✅ For elements containing mixed text nodes (like paragraphs with <code> tags inside them), use:  
   **screen.getByText((content, element) => element?.textContent === 'Exact text here')** to ensure proper matching.  
  ✅ User interactions (Clicks, inputs, form submissions, keyboard navigation).  
  ✅ State updates & conditional rendering (Testing UI behavior when props or state change).  
  ✅ Form validation & submission handling (Verifying error messages, required fields).  
  ✅ Asynchronous behavior & API responses (Mocking Axios/Fetch, using waitFor).  
  ✅ Loading & error states (Ensuring UI updates before, during, and after API calls).  
  ✅ Accessibility checks (Proper ARIA attributes, labels, focus handling).  
  ✅ Snapshot testing (Optional but useful for detecting unintended UI changes).  
  
  ## **API Mocking:**  
  If the component makes Axios calls, **mock Axios properly using jest.mock**.
  
  🚨 **The output must be a fully executable Jest test file with no modifications needed.**  
  🚨 **Do not include any additional text before or after the code. Just start the output with import statements.**  
  🚨 **DO NOT wrap the output in backticks, markdown formatting, or any other syntax markers.**  
  ### **Component Code**
  --------------------------------------------
  ${componentCode}
  --------------------------------------------
  `;

  try {
    
    const response = await ollama.chat({
      model: 'deepseek-coder:1.3b',
      messages: [{ role: 'user', content: firstPrompt }],
      options: { temperature: 0.3 } // Lower temperature for more deterministic output
  });

  const firstResponse = response.message.content

  
  const secondPrompt = `
  You are an AI agent that specializes in automated test code generation. Your job is to refine the test case file that i generated, ensuring high-quality, intuitive, and ready-to-run test code. Your role is to automate my test writing process, saving me time and effort while producing effective and reliable test cases.
  ## **Rules:**
  1️⃣ **Output only runnable Jest test code, formatted for ${componentName}.test.js.**  
  2️⃣ **No explanations, comments, or additional text before or after the code.**  
  3️⃣ **DO NOT wrap the output in backticks, markdown formatting, or any other syntax markers.**  
  4️⃣ **Begin the output directly with import statements.**  
  5️⃣ **Ensure all necessary imports (@testing-library/react, user-event, react, and jest.mock for Axios if applicable).**  
  
  ## **Test Coverage:**
  ✅ Component renders without errors (Smoke test).  
  ✅ Presence of expected elements (Use getByRole for headings, buttons, etc., and getByText for other elements).
  ✅ For elements containing mixed text nodes (like paragraphs with <code> tags inside them), use:  
   **screen.getByText((content, element) => element?.textContent === 'Exact text here')** to ensure proper matching.  
  ✅ User interactions (Clicks, inputs, form submissions, keyboard navigation).  
  ✅ State updates & conditional rendering (Testing UI behavior when props or state change).  
  ✅ Form validation & submission handling (Verifying error messages, required fields).  
  ✅ Asynchronous behavior & API responses (Mocking Axios/Fetch, using waitFor).  
  ✅ Loading & error states (Ensuring UI updates before, during, and after API calls).  
  ✅ Accessibility checks (Proper ARIA attributes, labels, focus handling).  
  ✅ Snapshot testing (Optional but useful for detecting unintended UI changes).  
  
  ## **API Mocking:**  
  If the component makes Axios calls, **mock Axios properly using jest.mock**.
  
  🚨 **The output must be a fully executable Jest test file with no modifications needed.**  
  🚨 **Do not include any additional text before or after the code. Just start the output with import statements.**  
  
  ### **Here is a test that i got refine this for me based on the above mentioined query**
  --------------------------------------------
  ${firstResponse}
  --------------------------------------------
  `

  const unitTest = await model.generateContent(secondPrompt).then((result) => {
    return result.response.text();
  });
  return unitTest
  } catch (error) {
    console.error("Error generating test file:", error);
    return null;
  }
}
