# BuNaMo to SQLite

A fusion of the [BuNaMo][1] and [Gramadan][2] repositories for the Irish language.

Contains:

- Tools for converting the BuNaMo data into a SQLite database.
- A pre-built version of the database.
- TypeScript code for working with the database (ported from Gramadan).

[1]: https://github.com/michmech/BuNaMo
[2]: https://github.com/michmech/Gramadan

## DB Schema

See **sql/Schema.sql** for the database schema.

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

## Structure

- Main entrypoint is in `main.ts`, which initializes the database and runs the conversion.
- The schema files is in `sql/Schema.sql`, and prepared statments are in `sql/PreparedStatements/`.
- The database abstractions are in `repository.ts`.

## Affiliation

I am not in any way affiliated with **Foras na Gaeilge**, the copyright holders of the data.
