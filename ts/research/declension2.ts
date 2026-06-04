import path from "node:path";
import { getExistingDb, Repository } from "../repository";
import { open } from "node:fs/promises";
import { _nn } from "../util";
import { Consonants, isSlender, palatalizationReplaceTable, palatalize, syncope } from "../mutators";

/* The goal of this file is to find rules for mapping 2nd declension nominative forms to genitive forms */

const db = getExistingDb(path.join(__dirname, "../../output/buNaMo.sqlite"));
const repository = new Repository(db);

type TransformationType = "+e"
  | "palatalized + e"
  | "palatalized alt + e"
  | "í" | "aí"
  | "íne"
  | "syncope + e"
  | "palatalized syncope + e"
  | "palatalized alt syncope + e"
  | "exception"
  | "unknown";

const palatalizedAltTable: [RegExp, string][] = [...palatalizationReplaceTable];
palatalizedAltTable[0] = [
  new RegExp(`^(.*[${Consonants}])?ea([${Consonants}]+)$`),
  "$1ei$2"
];

function findCommonPrefixIndex(s1: string, s2: string): number {
  const minLength = Math.min(s1.length, s2.length);
  for (let i = 0; i < minLength; i++) {
    if (s1[i] !== s2[i]) {
      return i;
    }
  }
  return minLength;
}

function classifyTransformation(nominative: string, genitive: string):
  TransformationType {
  if (genitive === nominative + "e")
    return "+e";
  else if (genitive === palatalize(nominative) + "e")
    return "palatalized + e";
  else if (nominative !== genitive && (genitive === nominative.replace(/each$/, "í")
    // For loilíoch -> loilí. Not sure if this is a general pattern or an exception.
    || genitive === nominative.replace(/íoch$/, "í"))
  ) {
    return "í";
  } else if (nominative !== genitive && genitive === nominative.replace(/ach$/, "aí"))
    return "aí";
  else if (nominative !== genitive && genitive === nominative.replace(/íon$/, "íne"))
    return "íne";
  else if (nominative !== genitive && genitive === syncope(nominative) + "e")
    return "syncope + e";
  else if (genitive === palatalize(syncope(nominative)) + "e")
    return "palatalized syncope + e";
  else if (nominative === "scian" || nominative === "caileann" || nominative === "blocshliabh" || nominative === "tuirlingt") {
    return "exception";
  } else if (genitive === palatalize(nominative, undefined, palatalizedAltTable) + "e") {
    return "palatalized alt + e";
  } else if (genitive === palatalize(syncope(nominative), undefined, palatalizedAltTable) + "e") {
    return "palatalized alt syncope + e";
  }
  else
    return "unknown";
}

const suffixToTransformationTypes: Map<
  string,
  Map<TransformationType, number>
> = new Map();

repository.initialize().then(async () => {
  const all2ndDeclensionNounsIter = repository.db.prepare(
    `SELECT
    n.noun_id AS nounId,
    n.declension AS declension,
    form.value AS value,
    form.gender AS gender,
    form.form_name AS formName
  FROM noun AS n
  JOIN noun_form AS form ON form.noun_id = n.noun_id
  WHERE n.declension = 2 AND form.form_name IN ('sgNom', 'sgGen')`
  ).iterate();

  const groupedNouns = Map.groupBy(
    all2ndDeclensionNounsIter,
    row => +(row.nounId?.toString() ?? 0)
  );

  const declensionNounsFile = await open(path.join(__dirname, "./output/all-2nd-declension-nouns.csv"), "w");
  declensionNounsFile.appendFile(
    [
      "nounId", "nominative", "genitive",
      "transformationType", "isSlender",
      "nomSuffix", "genSuffix"
    ].join(",") + "\n"
  );
  for (const [nounId, rows] of groupedNouns) {
    const nominativeRow = rows.find(row => row.formName === "sgNom");
    const genitiveRow = rows.find(row => row.formName === "sgGen");
    if (!nominativeRow || !genitiveRow) {
      console.warn(`Missing nominative or genitive for nounId ${nounId}`);
      continue;
    }
    const nominative = _nn(nominativeRow.value).toString();
    const genitive = _nn(genitiveRow.value).toString();

    if (!genitive.endsWith("e")
      && !genitive.endsWith("í")) {
      console.warn(`Mistake in data: Genitive does not end with 'e' or '(a)í' for nounId ${nounId}: ${nominative} -> ${genitive}`);
    } else {
      const commonPrefixIdx = findCommonPrefixIndex(nominative, genitive);
      const nomSuffix = nominative.slice(commonPrefixIdx - 1);
      const genSuffix = genitive.slice(commonPrefixIdx - 1);
      const transformationType = classifyTransformation(nominative, genitive);
      const isSlenderValue = isSlender(nominative);

      const suffixKey = `${nomSuffix} -> ${genSuffix}`;
      if (!suffixToTransformationTypes.has(suffixKey)) {
        suffixToTransformationTypes.set(suffixKey, new Map());
      }
      const transformationMap = suffixToTransformationTypes.get(suffixKey)!;
      transformationMap.set(
        transformationType,
        (transformationMap.get(transformationType) ?? 0) + 1
      );

      await declensionNounsFile.appendFile([
        nounId,
        nominative,
        genitive,
        transformationType,
        isSlenderValue,
        nomSuffix,
        genSuffix
      ].map(value => JSON.stringify(value)).join(",") + "\n");
    }
  }

  const nounStatsFile = await open(path.join(__dirname, "./output/2nd-declension-transformation-stats.txt"), "w");

  await nounStatsFile.appendFile("Transformation types by suffix:\n");
  for (const [suffix, transformationMap] of suffixToTransformationTypes) {
    await nounStatsFile.appendFile(`Suffix: ${suffix}\n`);
    let idx = 1;
    for (const [transformationType, count] of transformationMap) {
      await nounStatsFile.appendFile(` ${idx}. ${transformationType}: ${count}\n`);
      idx++;
    }
  }

  await declensionNounsFile.close();
  await nounStatsFile.close();
});