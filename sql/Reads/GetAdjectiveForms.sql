SELECT
  form.adjective_form_id AS adjectiveFormId,
  form.form_name AS formName,
  form.value AS value
FROM
  adjective_form form
WHERE form.adjective_id = :foundId