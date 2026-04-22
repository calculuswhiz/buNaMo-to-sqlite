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

  test('Test reading noun data', () => {
    const noun = _nn(
      repository.getNounByLemma("cat"),
      'Noun not found'
    );

    assert.equal(noun.getLemma(), "cat");
    assert.equal(noun.getGender(), "masc");
    assert.equal(noun.forms.sgGen[0].value, "cait");
    assert.equal(noun.forms.plNom[0].value, "cait");
    assert.equal(noun.forms.plGen[0].value, "cat");
  });

  test('Test reading noun phrase data', () => {
    const nounPhrase = _nn(
      repository.getNounPhraseByLemma("fadhb mhór"),
      'Noun phrase not found'
    );

    assert.equal(nounPhrase.getLemma(), "fadhb mhór");
    assert.equal(nounPhrase.getGender(), "fem");
    assert.equal(nounPhrase.forms.sgGen[0].value, "faidhbe móire");
    assert.equal(nounPhrase.forms.sgNomArt[0].value, "an fhadhb mhór");
    assert.equal(nounPhrase.forms.sgGenArt[0].value, "na faidhbe móire");
    assert.equal(nounPhrase.forms.plNom[0].value, "fadhbanna móra");
    assert.equal(nounPhrase.forms.plGen[0].value, "fadhbanna móra");
    assert.equal(nounPhrase.forms.plNomArt[0].value, "na fadhbanna móra");
    assert.equal(nounPhrase.forms.plGenArt[0].value, "na bhfadhbanna móra");
  });
  
  test('Test reading possessive data', () => {
    const possessive = _nn(
      repository.getPossessiveByLemma("mo"),
      'Possessive not found'
    );
    
    assert.equal(possessive.getLemma(), "mo");
    assert.equal(possessive.mutation, "len1");
    assert.equal(possessive.emphasizer, "saSe");
    assert.equal(possessive.forms.full[0].value, "mo");
    assert.equal(possessive.forms.apos[0].value, "m'");
  });

  test('Test reading preposition data', () => {
    const preposition = _nn(
      repository.getPrepositionByLemma("ag"),
      'Preposition not found'
    );
    
    assert.equal(preposition.getLemma(), "ag");
    assert.equal(preposition.disambig, "");
    assert.equal(preposition.forms.sg1[0].value, "agam");
    assert.equal(preposition.forms.sg2[0].value, "agat");
    assert.equal(preposition.forms.sg3Masc[0].value, "aige");
    assert.equal(preposition.forms.sg3Fem[0].value, "aici");
    assert.equal(preposition.forms.pl1[0].value, "againn");
    assert.equal(preposition.forms.pl2[0].value, "agaibh");
    assert.equal(preposition.forms.pl3[0].value, "acu");
  });

  test('Test reading verb data', () => {
    const verb = _nn(
      repository.getVerbByLemma("ól"),
      'Verb not found'
    );

    console.log(JSON.stringify(verb, null, 2));

    assert.equal(verb.getLemma(), "ól");
    assert.equal(verb.disambig, "");
    assert.equal(verb.forms.verbalNoun[0].value, "ól");
    assert.equal(verb.forms.verbalAdjective[0].value, "ólta");
    assert.equal(verb.forms.tenses.PresCont.Indep.Base[0].value, "ólann");
    assert.equal(verb.forms.tenses.PresCont.Indep.Sg1[0].value, "ólaim");

    // TODO rest of conjugations are not well-mapped
  });
});

