SELECT
  form.verb_form_id AS verbFormId,
  form.form_type AS formType,
  form.value AS value,
  form.tense AS tense,
  form.dependency AS dependency,
  form.mood AS mood,
  form.person AS person
FROM
  verb_form form
WHERE form.verb_id = :verbId