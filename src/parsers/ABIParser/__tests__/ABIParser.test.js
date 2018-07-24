/* eslint-env jest */
/* eslint-disable no-console,camelcase */

import createSandbox from 'jest-sandbox';

import ABIParser from '../index';
import MetaCoinABI from '../__fixtures__/MetaCoinABI';

import PARAM_TYPES from '../../../modules/paramTypes';

const [
  lastSenderABI,
  constructorABI,
  transferABI,
  sendCoinABI,
] = MetaCoinABI.abi;

const contractData = Object.assign(
  { address: '0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9' },
  MetaCoinABI,
);

describe('ABIParser', () => {
  const sandbox = createSandbox();

  beforeEach(() => {
    sandbox.clear();
  });

  test('It should provide a name', () => {
    expect(ABIParser.name).toEqual('abi');
  });

  test('It parses contract specs from a JSON ABI', () => {
    const parser = new ABIParser();
    sandbox.spyOn(parser.constructor, 'parseABI');
    sandbox.spyOn(parser.constructor, 'parseMethodSpec');
    sandbox.spyOn(parser.constructor, 'parseEventSpec');
    sandbox.spyOn(parser.constructor, 'parseConstantSpec');

    const result = parser.parse(contractData);

    expect(parser.constructor.parseABI).toHaveBeenCalled();

    // The constructor function should not be parsed
    expect(parser.constructor.parseMethodSpec).not.toHaveBeenCalledWith(
      constructorABI,
    );
    expect(parser.constructor.parseEventSpec).not.toHaveBeenCalledWith(
      constructorABI,
    );
    expect(parser.constructor.parseConstantSpec).not.toHaveBeenCalledWith(
      constructorABI,
    );

    expect(result).toHaveProperty(
      'constants',
      expect.objectContaining({
        getBalance: [expect.any(Object)],
        overloaded: [
          {
            name: 'overloaded',
            input: [
              {
                name: 'a',
                type: PARAM_TYPES.INTEGER,
              },
              {
                name: 'b',
                type: PARAM_TYPES.INTEGER,
              },
              {
                name: 'c',
                type: PARAM_TYPES.INTEGER,
              },
            ],
            output: [
              {
                name: 'sum',
                type: PARAM_TYPES.INTEGER,
              },
            ],
          },
          {
            name: 'overloaded',
            input: [
              {
                name: 'a',
                type: PARAM_TYPES.INTEGER,
              },
              {
                name: 'b',
                type: PARAM_TYPES.INTEGER,
              },
            ],
            output: [
              {
                name: 'sum',
                type: PARAM_TYPES.INTEGER,
              },
            ],
          },
          {
            name: 'overloaded',
            input: [
              {
                name: 'a',
                type: PARAM_TYPES.INTEGER,
              },
              {
                name: 'b',
                type: PARAM_TYPES.BOOLEAN,
              },
            ],
            output: [
              {
                name: 'sum',
                type: PARAM_TYPES.INTEGER,
              },
            ],
          },
        ],
      }),
    );
    expect(result).toHaveProperty(
      'events',
      expect.objectContaining({ Transfer: [expect.any(Object)] }),
    );
    expect(result).toHaveProperty(
      'methods',
      expect.objectContaining({ sendCoin: [expect.any(Object)] }),
    );
    expect(result).toHaveProperty('address', contractData.address);
  });

  test('It parses method specs', () => {
    const parser = new ABIParser();
    sandbox.spyOn(parser.constructor, 'parseParams');

    expect(parser.constructor.parseMethodSpec(sendCoinABI)).toEqual({
      name: 'sendCoin',
      input: [
        {
          name: 'receiver',
          type: PARAM_TYPES.ADDRESS,
        },
        {
          name: 'amount',
          type: PARAM_TYPES.INTEGER,
        },
      ],
      output: [
        {
          name: 'sufficient',
          type: PARAM_TYPES.BOOLEAN,
        },
      ],
      isPayable: false,
    });
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      sendCoinABI.inputs,
      sendCoinABI.name,
    );
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      sendCoinABI.outputs,
      sendCoinABI.name,
    );
    parser.constructor.parseParams.mockClear();

    const noInputs = 'test without inputs or outputs';
    expect(
      parser.constructor.parseMethodSpec({
        name: noInputs,
        constant: false,
        stateMutability: 'nonpayable',
        type: 'function',
      }),
    ).toEqual({
      name: noInputs,
      input: [],
      output: [],
      isPayable: false,
    });
    expect(parser.constructor.parseParams).toHaveBeenCalledTimes(2);
    expect(parser.constructor.parseParams).toHaveBeenCalledWith([], noInputs);
    parser.constructor.parseParams.mockClear();
  });

  test('It parses constant specs', () => {
    const parser = new ABIParser();
    sandbox.spyOn(parser.constructor, 'parseParams');

    expect(parser.constructor.parseConstantSpec(lastSenderABI)).toEqual({
      input: [],
      name: lastSenderABI.name,
      output: [
        {
          name: lastSenderABI.name,
          type: PARAM_TYPES.ADDRESS,
        },
      ],
    });
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      [],
      lastSenderABI.name,
    );
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      [{ type: 'address', name: lastSenderABI.name }],
      lastSenderABI.name,
    );
    parser.constructor.parseParams.mockClear();

    const noInputsOrOutputsName = 'no inputs or outputs';
    expect(
      parser.constructor.parseConstantSpec({
        name: noInputsOrOutputsName,
      }),
    ).toEqual({ input: [], output: [], name: noInputsOrOutputsName });
    expect(parser.constructor.parseParams).toHaveBeenCalledTimes(2);
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      [],
      noInputsOrOutputsName,
    );
  });

  test('It parses event specs', () => {
    const parser = new ABIParser();
    sandbox.spyOn(parser.constructor, 'parseParams');

    expect(parser.constructor.parseEventSpec(transferABI)).toEqual({
      name: transferABI.name,
      output: [
        {
          name: 'from',
          type: PARAM_TYPES.ADDRESS,
        },
        {
          name: 'to',
          type: PARAM_TYPES.ADDRESS,
        },
        {
          name: 'value',
          type: PARAM_TYPES.INTEGER,
        },
      ],
    });
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      transferABI.inputs,
      transferABI.name,
    );
    parser.constructor.parseParams.mockClear();

    const noInputsName = 'no inputs';
    expect(
      parser.constructor.parseEventSpec({
        name: noInputsName,
      }),
    ).toEqual({ output: [], name: noInputsName });
    expect(parser.constructor.parseParams).toHaveBeenCalledTimes(1);
    expect(parser.constructor.parseParams).toHaveBeenCalledWith(
      [],
      noInputsName,
    );
  });

  test('It parses ABI types', () => {
    const parser = new ABIParser();
    sandbox
      .spyOn(parser.constructor, 'parseTupleType')
      .mockImplementationOnce(() => 'parsed tuple components');

    const components = ['components'];
    expect(parser.constructor.parseType('tuple', components)).toEqual(
      'parsed tuple components',
    );
    expect(parser.constructor.parseTupleType).toHaveBeenCalledWith(components);

    expect(parser.constructor.parseType('address')).toEqual(
      PARAM_TYPES.ADDRESS,
    );

    expect(parser.constructor.parseType('uint8')).toEqual(PARAM_TYPES.INTEGER);

    expect(() => {
      parser.constructor.parseType('an invalid type');
    }).toThrow('Type "an invalid type" could not be matched');
  });

  test('It parses tuple types', () => {
    const parser = new ABIParser();
    sandbox.spyOn(parser.constructor, 'parseFieldName');
    sandbox.spyOn(parser.constructor, 'parseType');

    const components = [
      {
        type: 'address',
        name: 'the_address',
      },
      {
        type: 'uint8',
      },
    ];

    const tupleType = parser.constructor.parseTupleType(components);
    expect(tupleType).toEqual({
      convertInput: expect.any(Function),
      convertOutput: expect.any(Function),
      validate: expect.any(Function),
    });
    expect(parser.constructor.parseFieldName).toHaveBeenCalledWith(
      'the_address',
      0,
    );
    expect(parser.constructor.parseFieldName).toHaveBeenCalledWith(
      undefined,
      1,
    );
    expect(parser.constructor.parseType).toHaveBeenCalledWith('address');
    expect(parser.constructor.parseType).toHaveBeenCalledWith('uint8');

    const the_address = '0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9';
    const field_1 = 123;
    expect(() => tupleType.validate()).toThrow('Must be an object');
    expect(() => tupleType.validate({ the_address: 'abc', field_1 })).toThrow(
      'Must be a valid address',
    );
    expect(tupleType.validate({ the_address, field_1 })).toBe(true);
    expect(tupleType.convertInput({ the_address, field_1 })).toEqual({
      the_address,
      field_1,
    });
    expect(tupleType.convertOutput({ the_address, field_1 })).toEqual({
      the_address,
      field_1,
    });

    const input = { id: 1 };
    const output = { id: 'one' };
    const idType = {
      validate: sandbox.fn(),
      convertInput: undefined, // parseTupleType should pass through the input
      convertOutput: sandbox.fn().mockReturnValue(output.id),
    };

    parser.constructor.parseType.mockReturnValueOnce(idType);
    const tupleTypeWithoutConversion = parser.constructor.parseTupleType([
      {
        type: 'uint8',
        name: 'id',
      },
    ]);

    // convertInput/convertOutput functions should have been created
    expect(tupleTypeWithoutConversion).toEqual({
      validate: expect.any(Function),
      convertInput: expect.any(Function),
      convertOutput: expect.any(Function),
    });

    // The validate fn for the tuple should call the validate fn for the type
    tupleTypeWithoutConversion.validate(input);
    expect(idType.validate).toHaveBeenCalledWith(1);

    // The input should pass through
    expect(tupleTypeWithoutConversion.convertInput(input)).toEqual(input);

    // The output fn for the tuple should call the output fn for the type
    expect(tupleTypeWithoutConversion.convertOutput(input)).toEqual(output);
    expect(idType.convertOutput).toHaveBeenCalledWith(1);
  });

  test('It parses params', () => {
    const parser = new ABIParser();
    sandbox.spyOn(parser.constructor, 'parseType');
    sandbox.spyOn(parser.constructor, 'parseFieldName');
    sandbox.spyOn(console, 'warn');

    expect(
      parser.constructor.parseParams(lastSenderABI.outputs, lastSenderABI.name),
    ).toEqual([
      {
        name: 'field_0',
        type: PARAM_TYPES.ADDRESS,
      },
    ]);
    expect(parser.constructor.parseType).toHaveBeenCalledWith(
      lastSenderABI.outputs[0].type,
      undefined,
    );
    expect(parser.constructor.parseFieldName).toHaveBeenCalledWith('', 0);
    expect(console.warn).toHaveBeenCalledWith(
      'No name supplied for field of type "address" of method "lastSender"',
    );
  });
});
