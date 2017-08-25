module.exports = (bn) => {
    bn.numVal = bn.toNumber();
    bn.strVal = bn.toString();
    return bn;
};