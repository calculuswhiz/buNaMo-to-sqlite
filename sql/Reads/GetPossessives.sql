SELECT
  p.possessive_id AS possessiveId,
  p.mutation AS mutation,
  p.emphasizer AS emphasizer,
  p.disambig AS disambig,
  p.lemma AS lemma
FROM possessive AS p
JOIN possessive_form AS form ON form.possessive_id = p.possessive_id
WHERE p.lemma = :lemma