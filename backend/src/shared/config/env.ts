import fs from "fs";
import path from "path";

if (process.env.NODE_ENV !== "production") {
	const dotenvPath = path.resolve(process.cwd(), ".env");
	if (fs.existsSync(dotenvPath)) {
		require("dotenv").config({ path: dotenvPath });
	}
}

export const ENV = {
	MONGODB_URI: process.env.MONGODB_URI || "",
	NODE_ENV: process.env.NODE_ENV || "development",
	OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
	OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2",
};
