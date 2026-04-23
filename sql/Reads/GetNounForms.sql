SELECT
  form.noun_form_id AS nounFormId,
  form.form_name AS formName,
  form.value AS value,
  form.gender AS gender,
  form.strength AS strength
FROM
  noun_form form
WHERE form.noun_id = :foundId