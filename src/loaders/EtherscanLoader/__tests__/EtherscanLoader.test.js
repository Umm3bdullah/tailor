/* eslint-env jest */
/* eslint-disable no-new */

import EtherscanLoader from '../index';
import HttpLoader from '../../HttpLoader';

describe('EtherscanLoader', () => {
  test('It should provide a name', () => {
    expect(EtherscanLoader.name).toEqual('etherscan');
  });

  test('Instantiating an EtherscanLoader', () => {
    expect(() => {
      new EtherscanLoader({ endpoint: '' });
    }).toThrow('An "endpoint" option must be provided');

    const loader = new EtherscanLoader();
    expect(loader).toHaveProperty('_endpoint');
    expect(loader).toBeInstanceOf(HttpLoader);
  });
});
