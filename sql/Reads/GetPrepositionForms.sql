SELECT
  form.preposition_form_id AS prepositionFormId,
  form.form_name AS formName,
  form.value AS value
FROM
  preposition_form form
WHERE form.preposition_id = :foundId