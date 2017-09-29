#!/bin/bash
solc -o .\out --optimize --bin --abi --ast --asm --overwrite ./src/contracts/RobomedIco.sol
#test
