SELECT
  form.possessive_form_id AS possessiveFormId,
  form.form_name AS formName,
  form.value AS value
FROM
  possessive_form form
WHERE form.possessive_id = :foundId