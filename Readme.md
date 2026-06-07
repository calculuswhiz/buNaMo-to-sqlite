# BuNaMo to SQLite

A fusion of the [BuNaMo][1] and [Gramadan][2] repositories for the Irish language.

Contains:

- Tools for converting the BuNaMo data into a SQLite database.
- A pre-built version of the database and an SQL file describing the schema.
- TypeScript code for working with the database (ported from Gramadan).
- Research on declension patterns in the BuNaMo data. Some reports can be found on the [wiki][3].

[1]: https://github.com/michmech/BuNaMo
[2]: https://github.com/michmech/Gramadan
[3]: https://github.com/calculuswhiz/buNaMo-to-sqlite/wiki/

## DB Schema

See **sql/Schema.sql** for the database schema.

### Differences between the original BuNaMo data and the sqlite database

There are a few breaking changes if you are used to working with the original BuNaMo data:

- Conditional is represented as a mood, not a tense.
- `PastCont` renamed to `PastHab` for Past Habitual
- `PresCont` renamed to `PresHab` and is not used as the default present tense
- Instead, `Pres` is used for this purpose, and `PresHab` is used for present habitual.
- Indicative mood is explicitly represented as `Ind` instead of null.

### Differences between TS library and Gramadan library

- Verb forms are not all calculated upon construction of a verb. Instead, call the conjugation methods to obtain them. If you really want an array of all conjugations, you can do `Array.from(verb.conjugateAll())` or `[...verb.conjugateAll()]`.
- Singular information is now functional and not a class.
- Plural information is now functional and not a class. Important: since strength is implicitly tied to the function name, it is not necessary to return that information.
- XML generation methods have not been implemented (yet?).

## Usage

### Converter

To run the converter tool, you need to clone the **Irish National Morphology Database** [repository][1] to the root of this project.

Then, install the npm dependencies:

```bash
npm install
```

Finally, run the conversion:

```bash
npm run rebuild
```

This creates `buNaMo.sqlite` in the output directory.

### Repository

The `repository.ts` file contains TypeScript code for working with the database. It provides methods for querying the database and retrieving data in a structured format (see **ts/model** for the data models).

It also contains the queries used to build the database, which are organized by category in the **sql** folder.

## Structure

- The schema files is in `sql/Schema.sql`, and prepared statments are organized by category in the folder.
- TypeScript files are in the **ts** folder
  - Main entrypoint is in `main.ts`, which initializes the database and runs the conversion.
  - The database abstractions are in `repository.ts`.

## Affiliation

I am not in any way affiliated with **Foras na Gaeilge**, the copyright holders of the data.

### Testing notes
- Noteworthy things are documented here: https://github.com/calculuswhiz/buNaMo-to-sqlite/wiki/Testing-notes
- Actionable issues will be added in the Issues tab.
