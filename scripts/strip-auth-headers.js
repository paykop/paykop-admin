const fs = require("fs");
const path = require("path");

function stripAuthHeaders(content) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]*headers:\s*\{\s*Authorization:\s*`Bearer \$\{token\}`\s*\},?/g, "")
    .replace(/\n[ \t]*headers:\s*\{\s*\n[ \t]*Authorization:\s*`Bearer \$\{token\}`,\s*\n[ \t]*\},?/g, "")
    .replace(/\n[ \t]*if \(token\) headers\.Authorization = `Bearer \$\{token\}`;\s*/g, "");
}

function stripStoreTokenChecks(content) {
  return content
    .replace(/\n[ \t]*const token = await getToken\(\);\s*\n[ \t]*if \(!token\) throw new Error\([^)]+\);\s*/g, "\n")
    .replace(/\n[ \t]*const token = getToken \? await getToken\(\) : undefined;\s*/g, "\n");
}

for (const file of fs.readdirSync("services")) {
  if (!file.endsWith(".ts") || file === "authService.ts" || file === "apiService.ts") continue;
  const p = path.join("services", file);
  const c = fs.readFileSync(p, "utf8");
  const u = stripAuthHeaders(c);
  if (u !== c) {
    fs.writeFileSync(p, u);
    console.log("service", file);
  }
}

for (const file of fs.readdirSync("store")) {
  const p = path.join("store", file);
  const c = fs.readFileSync(p, "utf8");
  const u = stripStoreTokenChecks(c);
  if (u !== c) {
    fs.writeFileSync(p, u);
    console.log("store", file);
  }
}
