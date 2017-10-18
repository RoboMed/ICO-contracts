solc -o .\out --optimize --bin --abi --ast --asm --overwrite .\src\contracts\zeppelin\ContractReceiver.sol
solc -o .\out --optimize --bin --abi --ast --asm --overwrite .\src\contracts\test\ContractReceiverForTestWithError.sol
solc -o .\out --optimize --bin --abi --ast --asm --overwrite .\src\contracts\test\ContractReceiverNotForErc223.sol