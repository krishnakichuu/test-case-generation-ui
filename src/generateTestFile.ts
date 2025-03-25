import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTestFile(componentPath, componentCode) {
  //TODO: idea of getting the testing frame work as a parameter trough CLI ??!
  const componentName = path.basename(componentPath, ".tsx");

  // Craft a prompt that instructs the AI to generate a Jest test suite.
  // The prompt asks it to generate tests that include:
  // - Basic rendering tests.
  // - User interaction tests.
  // - Mocking axios API calls if the component includes them.
  const prompt = `
Generate a Jest test suite for a React component using React Testing Library.
The component code is provided below:
--------------------------------------------
${componentCode}
--------------------------------------------
Please generate unit tests that cover the following:
- Verify that the component renders correctly.
- Check for any text or elements rendered.
- If the component makes API calls using axios, include mocking for axios.
- Simulate any user interactions if applicable.
Output the test suite in a file format that can be saved as "${componentName}.test.js".
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5 Turbo for free accounts.
      messages: [
        {
          role: "system",
          content:
            "You are an expert React developer who writes test cases using Jest and React Testing Library.",
        },
        { role: "user", content: prompt },
      ],
    });

    const generatedTestFile = response.choices[0].message.content;
    return generatedTestFile;
  } catch (error) {
    console.error("Error generating test file:", error);
    return null;
  }
}
