const fs = require("fs-extra");

const saveInfo = (name, contractAddress) => {
  const InfoData = { address: contractAddress.toString() };

  fs.writeFileSync(
    `./constants/${name}.json`,
    JSON.stringify(InfoData),
    "utf8"
  );
};

module.exports = { saveInfo };
