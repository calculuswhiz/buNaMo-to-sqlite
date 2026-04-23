SELECT
  p.preposition_id AS prepositionId,
  p.disambig AS disambig,
  p.lemma AS lemma
FROM preposition AS p
JOIN preposition_form AS form ON form.preposition_id = p.preposition_id
WHERE p.lemma = :lemma