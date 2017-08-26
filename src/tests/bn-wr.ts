import * as BigNumber from 'bignumber.js';

export interface BnWr extends BigNumber.BigNumber {
	numVal: any;
	strVal: string;
}

export function bnWr(bn: BigNumber.BigNumber): BnWr {
	(<BnWr>bn).numVal = bn.toNumber();
	(<BnWr>bn).strVal = bn.toString();

	return <BnWr>bn;
}