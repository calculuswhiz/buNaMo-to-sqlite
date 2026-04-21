import path from 'node:path';
import { Repository, getExistingDb } from '../repository';
import test from 'node:test';
import assert from 'node:assert/strict';
import { _nn } from '../util';

const db = getExistingDb(path.join(__dirname, '../../output/buNaMo.sqlite'));
const repository = new Repository(db);
repository.initialize().then(async () => {
  test('Test reading adjective data', () => {
    const adjective = _nn(
      repository.getAdjectiveByLemma("féasógach"),
      'Adjective not found'
    );
    assert.equal(adjective.getLemma(), "féasógach");

    assert.equal(adjective.getComparativePresent()[0], 'níos féasógaí');
    assert.equal(adjective.getSuperlativePresent()[0], 'is féasógaí');
    assert.equal(adjective.getComparativePast()[0], "ní b'fhéasógaí");
    assert.equal(adjective.getSuperlativePast()[0], 'ab fhéasógaí');
  });
});

