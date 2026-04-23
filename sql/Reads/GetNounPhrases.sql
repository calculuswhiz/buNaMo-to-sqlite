SELECT
  np.noun_phrase_id AS nounPhraseId,
  np.is_definite AS isDefinite,
  np.is_possessed AS isPossessed,
  np.is_immutable AS isImmutable,
  np.force_nominative AS forceNominative,
  np.disambig AS disambig
FROM noun_phrase AS np
JOIN noun_phrase_form AS form ON form.noun_phrase_id = np.noun_phrase_id
WHERE form.form_name = 'sgNom' AND form.value = :lemma