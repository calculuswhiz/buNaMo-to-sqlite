SELECT
  n.noun_id AS nounId,
  n.declension AS declension,
  n.is_proper AS isProper,
  n.is_immutable AS isImmutable,
  n.is_definite AS isDefinite,
  n.allow_articled_genitive AS allowArticledGenitive,
  n.disambig AS disambig
FROM noun AS n
JOIN noun_form AS form ON form.noun_id = n.noun_id
WHERE form.form_name = 'sgNom' AND form.value = :lemma