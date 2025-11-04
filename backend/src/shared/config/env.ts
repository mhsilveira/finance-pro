import fs from "fs";
import path from "path";

if (process.env.NODE_ENV !== "production") {
	const dotenvPath = path.resolve(process.cwd(), ".env");
	if (fs.existsSync(dotenvPath)) {
		// lazy import para não exigir dependência em prod
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		require("dotenv").config({ path: dotenvPath });
	}
}

export const ENV = {
	MONGODB_URI: process.env.MONGODB_URI || "",
	NODE_ENV: process.env.NODE_ENV || "development",
};
