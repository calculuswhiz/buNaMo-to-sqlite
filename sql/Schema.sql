PRAGMA foreign_keys = ON;

-- Every xml file entry is a lexeme
CREATE TABLE
  IF NOT EXISTS lexeme (
    id INTEGER PRIMARY KEY,
    kind TEXT NOT NULL CHECK (
      kind IN (
        /*  While the C# code has more types, like "prepositional phrase" and "verb phrase",
        There are no XML files of those types, so we can ignore them for now.
         */
        'noun',
        'nounPhrase',
        'adjective',
        'verb',
        'preposition',
        'possessive'
      )
    ),
    lemma TEXT NOT NULL,
    disambig TEXT NOT NULL DEFAULT ''
    /* Cannot add unique constraint here. XML data is not guaranteed to be unique at this level, even with disambig. Perhaps the filenames could be considered as a field? */
  );

CREATE TABLE
  IF NOT EXISTS noun (
    lexeme_id INTEGER PRIMARY KEY REFERENCES lexeme (id) ON DELETE CASCADE,
    declension INTEGER NOT NULL DEFAULT 0,
    is_proper INTEGER NOT NULL DEFAULT 0 CHECK (is_proper IN (0, 1)),
    is_immutable INTEGER NOT NULL DEFAULT 0 CHECK (is_immutable IN (0, 1)),
    is_definite INTEGER NOT NULL DEFAULT 0 CHECK (is_definite IN (0, 1)),
    allow_articled_genitive INTEGER NOT NULL DEFAULT 0 CHECK (allow_articled_genitive IN (0, 1))
  );

CREATE TABLE
  IF NOT EXISTS noun_form (
    id INTEGER PRIMARY KEY,
    noun_id INTEGER NOT NULL REFERENCES noun (lexeme_id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (
      slot IN (
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
    lexeme_id INTEGER PRIMARY KEY REFERENCES lexeme (id) ON DELETE CASCADE,
    is_definite INTEGER NOT NULL DEFAULT 0 CHECK (is_definite IN (0, 1)),
    is_possessed INTEGER NOT NULL DEFAULT 0 CHECK (is_possessed IN (0, 1)),
    is_immutable INTEGER NOT NULL DEFAULT 0 CHECK (is_immutable IN (0, 1)),
    force_nominative INTEGER NOT NULL DEFAULT 0 CHECK (force_nominative IN (0, 1))
  );

CREATE TABLE
  IF NOT EXISTS noun_phrase_form (
    id INTEGER PRIMARY KEY,
    noun_phrase_id INTEGER NOT NULL REFERENCES noun_phrase (lexeme_id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (
      slot IN (
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
    lexeme_id INTEGER PRIMARY KEY REFERENCES lexeme (id) ON DELETE CASCADE,
    declension INTEGER NOT NULL DEFAULT 0,
    is_pre INTEGER NOT NULL DEFAULT 0 CHECK (is_pre IN (0, 1))
  );

CREATE TABLE
  IF NOT EXISTS adjective_form (
    id INTEGER PRIMARY KEY,
    adjective_id INTEGER NOT NULL REFERENCES adjective (lexeme_id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (
      slot IN (
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
    lexeme_id INTEGER PRIMARY KEY REFERENCES lexeme (id) ON DELETE CASCADE
  );

CREATE TABLE
  IF NOT EXISTS verb_form (
    id INTEGER PRIMARY KEY,
    verb_id INTEGER NOT NULL REFERENCES verb (lexeme_id) ON DELETE CASCADE,
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
    ),
    UNIQUE (
      verb_id,
      form_type,
      tense,
      dependency,
      mood,
      person
    )
  );

CREATE TABLE
  IF NOT EXISTS preposition (
    lexeme_id INTEGER PRIMARY KEY REFERENCES lexeme (id) ON DELETE CASCADE
  );

CREATE TABLE
  IF NOT EXISTS preposition_form (
    id INTEGER PRIMARY KEY,
    preposition_id INTEGER NOT NULL REFERENCES preposition (lexeme_id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (
      slot IN (
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
    lexeme_id INTEGER PRIMARY KEY REFERENCES lexeme (id) ON DELETE CASCADE,
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
    emphasizer TEXT NOT NULL CHECK (emphasizer IN ('saSe', 'sanSean', 'naNe'))
  );

CREATE TABLE
  IF NOT EXISTS possessive_form (
    id INTEGER PRIMARY KEY,
    possessive_id INTEGER NOT NULL REFERENCES possessive (lexeme_id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK (slot IN ('full', 'apos')),
    value TEXT NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_lexeme_kind_lemma ON lexeme (kind, lemma);

CREATE INDEX IF NOT EXISTS idx_noun_form_value ON noun_form (value);

CREATE INDEX IF NOT EXISTS idx_adj_form_value ON adjective_form (value);

CREATE INDEX IF NOT EXISTS idx_verb_form_value ON verb_form (value);

CREATE INDEX IF NOT EXISTS idx_prep_form_value ON preposition_form (value);

CREATE INDEX IF NOT EXISTS idx_poss_form_value ON possessive_form (value);