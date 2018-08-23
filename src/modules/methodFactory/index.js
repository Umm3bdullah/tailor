/* @flow */

import BigNumber from 'bn.js';

import type { MethodSpec, FunctionParams } from '../../interface/ContractSpec';
import getFunctionCall from '../getFunctionCall';
// eslint-disable-next-line import/no-cycle
import Transaction from '../transactions/ContractTransaction';
// eslint-disable-next-line import/no-cycle
import Lighthouse from '../../Lighthouse';
import HookManager from '../HookManager';

function isOptions(input: any) {
  return (
    typeof input === 'object' &&
    ['value', 'gas', 'gasLimit'].some(
      option =>
        BigNumber.isBN(input[option]) || typeof input[option] === 'number',
    )
  );
}

function getMethodFn(
  lighthouse: Lighthouse,
  functionParams: FunctionParams,
  isPayable?: boolean,
) {
  const hooks = new HookManager();
  const fn = function method(...inputParams: any) {
    const options = isOptions(inputParams[inputParams.length - 1])
      ? inputParams.pop()
      : {};
    if (!isPayable && options.value)
      throw new Error('Cannot send a value to a non-payable function');
    // TODO: do we want to hook inputParams?
    const functionCall = getFunctionCall(functionParams, ...inputParams);
    return new Transaction(lighthouse, {
      functionCall,
      hooks,
      ...options,
    });
  };
  fn.hooks = hooks.createHooks();
  return fn;
}

/*
 * Given a specification for a method function, eeturn an async function
 * which can be called with any valid input.
 */
export default function methodFactory(
  lighthouse: Lighthouse,
  { name, input = {}, isPayable }: MethodSpec,
) {
  const functionSignatures = Object.keys(input);

  // If input wasn't provided, use the method name (presumed to be the
  // function signature) to produce the function parameters we need.
  const functionParams =
    functionSignatures.length === 0 ? { [name]: [] } : input;

  const fn = getMethodFn(lighthouse, functionParams, isPayable);

  // Allow each function signature to be called specifically by adding
  // properties to the method function
  functionSignatures.forEach(functionSignature => {
    fn[functionSignature] = getMethodFn(
      lighthouse,
      { [functionSignature]: functionParams[functionSignature] },
      isPayable,
    );
  });

  return fn;
}