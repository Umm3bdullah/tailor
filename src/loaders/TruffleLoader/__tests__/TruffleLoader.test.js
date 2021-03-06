/* eslint-env jest */
/* eslint-disable no-new,max-len */

import TruffleLoader from '../index';
import FSLoader from '../../FSLoader';
import truffleTransformArtifact from '../../transforms/transformTruffleArtifact';

describe('TruffleLoader', () => {
  test('It should provide a name', () => {
    expect(TruffleLoader.name).toEqual('truffle');
  });

  test('Instantiating a TruffleLoader', () => {
    expect(() => {
      new TruffleLoader({ directory: '' });
    }).toThrow('A "directory" option must be provided');

    const directory = '~/contracts';
    const loader = new TruffleLoader({ directory });
    expect(loader).toHaveProperty('_directory', directory);
    expect(loader).toHaveProperty('_transform', truffleTransformArtifact);
    expect(loader).toBeInstanceOf(FSLoader);
  });
});
