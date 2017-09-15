const fs = require('fs');


function getText(filePath) {
  return fs
    .readFileSync(filePath)
    .toString()
    .split("\n")
    .filter(s => s.indexOf("import ") < 0 && s.indexOf("pragma "))
    .join("\n");

}

let all =
  [
    "pragma solidity ^0.4.11;"].concat(
    [
      "./src/contracts/zeppelin/Math.sol",
      "./src/contracts/zeppelin/SafeMath.sol",
      "./src/contracts/zeppelin/Ownable.sol",
      "./src/contracts/zeppelin/ERC20Basic.sol",
      "./src/contracts/zeppelin/ERC20.sol",
      "./src/contracts/RobomedIco.sol"
    ].map(p => getText(p))
  ).join("\r\n\r\n\r\n");

fs.writeFileSync("./src/contracts/RobomedIcoAllInOne.sol", all);
console.log("all ok");