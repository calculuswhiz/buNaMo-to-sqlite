SELECT
  form.noun_phrase_form_id AS nounPhraseFormId,
  form.form_name AS formName,
  form.value AS value,
  form.gender AS gender
FROM
  noun_phrase_form form
WHERE form.noun_phrase_id = :foundId