SELECT
  adj.adjective_id AS adjectiveId,
  adj.declension AS declension,
  adj.is_pre AS isPre,
  adj.disambig AS disambig
FROM adjective AS adj
JOIN adjective_form AS form ON form.adjective_id = adj.adjective_id
WHERE form.form_name = 'sgNom' AND form.value = :lemma