SELECT
  v.verb_id AS verbId,
  v.disambig AS disambig
FROM verb AS v
JOIN verb_form AS f ON f.verb_id = v.verb_id
WHERE
  (f.tense = 'Pres' AND f.dependency = 'Dep' AND f.person = 'Sg2' AND f.value = :lemma)
    OR (f.tense = 'Past' AND f.dependency = 'Indep' AND f.person = 'Base' AND f.value = :lemma)