# BuNaMo to SQLite

A simple tool to convert Irish National Morphology Database (BuNaMo) XML files to a SQLite database.

## DB Schema

See Schema.sql for the database schema.

## Usage

To run this tool, you need to clone the **Irish National Morphology Database**
[repository][1] to the root of this project.

[1]: https://github.com/michmech/BuNaMo

Then, install the npm dependencies:

```bash
npm install
```

Finally, run the conversion:

```bash
npx tsx ./main.ts
```

This creates `buNaMo.sqlite` in the output directory.

## About

The schema was based on the content in the [Gramadan][2] repository.
I wanted something more database-like for another project.

You can find a pre-built version of the database in the `output` directory.

[2]: https://github.com/michmech/Gramadan

## Affiliation

I am not in any way affiliated with Foras na Gaeilge, the copyright holders of
the data.

