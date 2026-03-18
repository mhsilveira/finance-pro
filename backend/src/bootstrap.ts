import moduleAlias from "module-alias";
import path from "path";

const buildRoot = path.join(process.cwd(), ".build", "src");
moduleAlias.addAliases({
	"@application": path.join(buildRoot, "application"),
	"@domain": path.join(buildRoot, "domain"),
	"@infrastructure": path.join(buildRoot, "infrastructure"),
	"@interface": path.join(buildRoot, "interface"),
	"@shared": path.join(buildRoot, "shared"),
});

if (process.env.IS_OFFLINE || process.env.NODE_ENV === "dev" || process.env.NODE_ENV === "development") {
	require("dotenv").config();
	console.log("[bootstrap] module-alias + dotenv prontos. NODE_ENV:", process.env.NODE_ENV);
}
