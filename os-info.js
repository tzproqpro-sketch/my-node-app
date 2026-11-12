const os = require("node:os");
const seconds = Math.floor(os.uptime());
console.log("Laboratory Work 18 | Group 477");
console.log("Platform:", os.platform());
console.log("OS type:", os.type());
console.log("Architecture:", os.arch());
console.log("Release:", os.release());
console.log("Host:", os.hostname());
console.log(
  "Uptime:",
  seconds,
  "seconds;",
  Math.floor(seconds / 3600),
  "hours",
  Math.floor((seconds % 3600) / 60),
  "minutes",
  seconds % 60,
  "seconds",
);
console.log(
  "You are using",
  { win32: "Windows", linux: "Linux", darwin: "macOS" }[os.platform()] ||
    "an unknown platform",
);
