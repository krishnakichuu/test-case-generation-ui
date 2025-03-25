#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { generateTestFile } from "./generateTestFile";

async function main() {
  const userFilePath = process.argv[2];

  if (!userFilePath) {
    console.error("❌ Please provide a file path. Example: ai-interface-cli src/Button.tsx");
    process.exit(1);
  }

  const absoluteFilePath = path.resolve(process.cwd(), userFilePath);
  console.log("Looking for file:", absoluteFilePath);

  if (!fs.existsSync(absoluteFilePath)) {
    console.error("❌ File not found:", absoluteFilePath);
    process.exit(1);
  }

  const componentCode = fs.readFileSync(absoluteFilePath, "utf-8");

  // Generate the test file using OpenAI
  const generatedTestCode = await generateTestFile(absoluteFilePath, componentCode);

  if (!generatedTestCode) {
    console.error("❌ Failed to generate test file.");
    process.exit(1);
  }

  // Create a new file name with ".test.js"
  const testFileName = path.basename(absoluteFilePath, ".tsx") + ".test.js";
  const testFilePath = path.join(path.dirname(absoluteFilePath), testFileName);

  // Write the generated test code to the file
  fs.writeFileSync(testFilePath, generatedTestCode);

  console.log(`✅ Test file generated and saved as: ${testFilePath}`);
}

main();
