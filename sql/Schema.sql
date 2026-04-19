PRAGMA foreign_keys = ON;

CREATE TABLE
  IF NOT EXISTS noun (
    noun_id INTEGER PRIMARY KEY,
    declension INTEGER NOT NULL DEFAULT 0,
    is_proper INTEGER NOT NULL DEFAULT 0 CHECK (is_proper IN (0, 1)),
    is_immutable INTEGER NOT NULL DEFAULT 0 CHECK (is_immutable IN (0, 1)),
    is_definite INTEGER NOT NULL DEFAULT 0 CHECK (is_definite IN (0, 1)),
    allow_articled_genitive INTEGER NOT NULL DEFAULT 0 CHECK (allow_articled_genitive IN (0, 1)),
    disambig TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS noun_form (
    noun_form_id INTEGER PRIMARY KEY,
    noun_id INTEGER NOT NULL REFERENCES noun (noun_id) ON DELETE CASCADE,
    form_name TEXT NOT NULL CHECK (
      form_name IN (
        'sgNom',
        'sgGen',
        'sgVoc',
        'sgDat',
        'plNom',
        'plGen',
        'plVoc',
        'count'
      )
    ),
    value TEXT NOT NULL,
    gender TEXT CHECK (
      gender IN ('masc', 'fem')
      OR gender IS NULL
    ),
    strength TEXT CHECK (
      strength IN ('strong', 'weak')
      OR strength IS NULL
    )
  );

CREATE TABLE
  IF NOT EXISTS noun_phrase (
    noun_phrase_id INTEGER PRIMARY KEY,
    is_definite INTEGER NOT NULL DEFAULT 0 CHECK (is_definite IN (0, 1)),
    is_possessed INTEGER NOT NULL DEFAULT 0 CHECK (is_possessed IN (0, 1)),
    is_immutable INTEGER NOT NULL DEFAULT 0 CHECK (is_immutable IN (0, 1)),
    force_nominative INTEGER NOT NULL DEFAULT 0 CHECK (force_nominative IN (0, 1)),
    disambig TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS noun_phrase_form (
    noun_phrase_form_id INTEGER PRIMARY KEY,
    noun_phrase_id INTEGER NOT NULL REFERENCES noun_phrase (noun_phrase_id) ON DELETE CASCADE,
    form_name TEXT NOT NULL CHECK (
      form_name IN (
        'sgNom',
        'sgGen',
        'sgNomArt',
        'sgGenArt',
        'sgDat',
        'sgDatArtN',
        'sgDatArtS',
        'plNom',
        'plGen',
        'plNomArt',
        'plGenArt',
        'plDat',
        'plDatArt'
      )
    ),
    value TEXT NOT NULL,
    gender TEXT CHECK (
      gender IN ('masc', 'fem')
      OR gender IS NULL
    )
  );

CREATE TABLE
  IF NOT EXISTS adjective (
    adjective_id INTEGER PRIMARY KEY,
    declension INTEGER NOT NULL DEFAULT 0,
    is_pre INTEGER NOT NULL DEFAULT 0 CHECK (is_pre IN (0, 1)),
    disambig TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS adjective_form (
    adjective_form_id INTEGER PRIMARY KEY,
    adjective_id INTEGER NOT NULL REFERENCES adjective (adjective_id) ON DELETE CASCADE,
    form_name TEXT NOT NULL CHECK (
      form_name IN (
        'sgNom',
        'sgGenMasc',
        'sgGenFem',
        'sgVocMasc',
        'sgVocFem',
        'plNom',
        'graded',
        'abstractNoun'
      )
    ),
    value TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS verb (
    verb_id INTEGER PRIMARY KEY,
    disambig TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS verb_form (
    verb_form_id INTEGER PRIMARY KEY,
    verb_id INTEGER NOT NULL REFERENCES verb (verb_id) ON DELETE CASCADE,
    form_type TEXT NOT NULL CHECK (
      form_type IN (
        'verbalNoun',
        'verbalAdjective',
        'tenseForm',
        'moodForm'
      )
    ),
    value TEXT NOT NULL,
    tense TEXT CHECK (
      tense IN (
        'Past',
        'PastCont',
        'Pres',
        'PresCont',
        'Fut',
        'Cond'
      )
      OR tense IS NULL
    ),
    dependency TEXT CHECK (
      dependency IN ('Indep', 'Dep')
      OR dependency IS NULL
    ),
    mood TEXT CHECK (
      mood IN ('Imper', 'Subj')
      OR mood IS NULL
    ),
    person TEXT CHECK (
      person IN (
        'Base',
        'Sg1',
        'Sg2',
        'Sg3',
        'Pl1',
        'Pl2',
        'Pl3',
        'Auto'
      )
      OR person IS NULL
    )
  );

CREATE TABLE
  IF NOT EXISTS preposition (
    preposition_id INTEGER PRIMARY KEY,
    disambig TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS preposition_form (
    preposition_form_id INTEGER PRIMARY KEY,
    preposition_id INTEGER NOT NULL REFERENCES preposition (preposition_id) ON DELETE CASCADE,
    form_name TEXT NOT NULL CHECK (
      form_name IN (
        'sg1',
        'sg2',
        'sg3Masc',
        'sg3Fem',
        'pl1',
        'pl2',
        'pl3'
      )
    ),
    value TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS possessive (
    possessive_id INTEGER PRIMARY KEY,
    mutation TEXT NOT NULL CHECK (
      mutation IN (
        'none',
        'len1',
        'len2',
        'len3',
        'ecl1',
        'ecl1x',
        'ecl2',
        'ecl3',
        'prefT',
        'prefH',
        'len1D',
        'len2D',
        'len3D'
      )
    ),
    emphasizer TEXT NOT NULL CHECK (emphasizer IN ('saSe', 'sanSean', 'naNe')),
    disambig TEXT NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS possessive_form (
    possessive_form_id INTEGER PRIMARY KEY,
    possessive_id INTEGER NOT NULL REFERENCES possessive (possessive_id) ON DELETE CASCADE,
    form_name TEXT NOT NULL CHECK (form_name IN ('full', 'apos')),
    value TEXT NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_noun_form_value ON noun_form (value);

CREATE INDEX IF NOT EXISTS idx_adj_form_value ON adjective_form (value);

CREATE INDEX IF NOT EXISTS idx_verb_form_value ON verb_form (value);

CREATE INDEX IF NOT EXISTS idx_prep_form_value ON preposition_form (value);

CREATE INDEX IF NOT EXISTS idx_poss_form_value ON possessive_form (value);