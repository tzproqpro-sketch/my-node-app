const os = require("node:os");
function maskMac(mac) {
  return mac.split(":").slice(0, 3).join(":") + ":**:**:**";
}
if (require.main === module) {
  const interfaces = os.networkInterfaces();
  let primary;
  for (const [name, addresses] of Object.entries(interfaces)) {
    console.log("Interface:", name);
    for (const address of addresses || []) {
      console.log(
        address.family,
        address.address,
        "MAC:",
        maskMac(address.mac),
        "Internal:",
        address.internal,
      );
      if (
        !primary &&
        !address.internal &&
        (address.family === "IPv4" || address.family === 4)
      )
        primary = name + " (" + address.address + ")";
    }
  }
  console.log("Interface count:", Object.keys(interfaces).length);
  console.log("Primary:", primary || "No external IPv4 interface");
  const user = os.userInfo();
  console.log("Username:", user.username);
  console.log("UID:", user.uid, "GID:", user.gid);
  console.log("Home:", user.homedir);
  console.log("Shell:", user.shell || process.env.ComSpec || "Unavailable");
  console.log("Group: 477; Root:", user.uid === 0);
}
module.exports = { maskMac };
