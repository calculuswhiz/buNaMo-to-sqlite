import { mutate, startsBilabial, startsVowel, startsVowelFhx } from "../mutators";
import { err, ok, type Result } from "../neverEverThrow";
import type { NounPhrase } from "./nounPhrase";
import type { Preposition } from "./preposition";

export type FormTypes = "sg" | "sgArtN" | "sgArtS" | "pl" | "plArt";

export class PrepositionalPhrase {
  preposition: Preposition;
  nounPhrase: NounPhrase;

  constructor(preposition: Preposition, nounPhrase: NounPhrase) {
    this.preposition = preposition;
    this.nounPhrase = nounPhrase;
  }

  getForm(formType: FormTypes): Result<string[], Error> {
    return this.nounPhrase.isPossessed
      ? this.getFormPossessed(formType)
      : this.getFormUnpossessed(formType);
  }

  private getFormPossessed(formType: FormTypes): Result<string[], Error> {
    const lemma = this.preposition.getLemma();
    switch (lemma) {
      case "de":
      case "do":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "dá ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "dár ")
                    : `${lemma} ${form.value}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "dá ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "dár ")
                    : `${lemma} ${form.value}`
              ));
          default:
            return ok([]);
        }
      case "faoi":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "faoina ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "faoinár ")
                    : `${lemma} ${form.value}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "faoina ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "faoinár ")
                    : `${lemma} ${form.value}`
              ));
          default:
            return ok([]);
        }
      case "i":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "ina ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "inár ")
                    : form.value.startsWith("bhur ")
                      ? form.value.replace(/^bhur /, "in bhur ")
                      : `${lemma} ${form.value}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "ina ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "inár ")
                    : form.value.startsWith("bhur ")
                      ? form.value.replace(/^bhur /, "in bhur ")
                      : `${lemma} ${form.value}`
              ));
          default:
            return ok([]);

        }
      case "le":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "lena ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "lenár ")
                    : `${lemma} ${form.value}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "lena ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "lenár ")
                    : `${lemma} ${form.value}`
              ));
          default:
            return ok([]);
        }
      case "ó":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "óna ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "ónár ")
                    : `${lemma} ${form.value}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "óna ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "ónár ")
                    : `${lemma} ${form.value}`
              ));
          default:
            return ok([]);
        }
      case "trí":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "trína ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "trínár ")
                    : `${lemma} ${form.value}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                form.value.startsWith("a ")
                  ? form.value.replace(/^a /, "trína ")
                  : form.value.startsWith("ár ")
                    ? form.value.replace(/^ár /, "trínár ")
                    : `${lemma} ${form.value}`
              ));
          default:
            return ok([]);
        }
      default:
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `${lemma} ${form.value}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `${lemma} ${form.value}`));
          default:
            return ok([]);
        }
    }
  }

  private getFormUnpossessed(formType: FormTypes): Result<string[], Error> {
    const lemma = this.preposition.getLemma();
    switch (lemma) {
      case "ag":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `${lemma} ${form.value}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `${lemma} ${form.value}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `${lemma} an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `${lemma} an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `${lemma} na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "ar":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `${lemma} ${mutate("len1", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `${lemma} ${mutate("len1", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `${lemma} an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `${lemma} an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `${lemma} na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "thar":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `${lemma} ${mutate("len1", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `${lemma} ${mutate("len1", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `${lemma} an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `${lemma} an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `${lemma} na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "as":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `${lemma} ${form.value}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `${lemma} ${form.value}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `${lemma} an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `${lemma} an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `${lemma} na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "chuig":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `${lemma} ${form.value}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `${lemma} ${form.value}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `${lemma} an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `${lemma} an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `${lemma} na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "de":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => {
                const txt = mutate("len1", form.value);
                return startsVowelFhx(txt) ? `d'${txt}` : `de ${txt}`;
              }));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => {
                const txt = mutate("len1", form.value);
                return startsVowelFhx(txt) ? `d'${txt}` : `de ${txt}`;
              }));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `den ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `den ${mutate(form.gender == "fem" ? "len3" : "len2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `de na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "do":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => {
                const txt = mutate("len1", form.value);
                return startsVowelFhx(txt) ? `d'${txt}` : `do ${txt}`;
              }));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => {
                const txt = mutate("len1", form.value);
                return startsVowelFhx(txt) ? `d'${txt}` : `do ${txt}`;
              }));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `don ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `don ${mutate(form.gender == "fem" ? "len3" : "len2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `do na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "faoi":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `faoi ${mutate("len1", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `faoi ${mutate("len1", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `faoin ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `faoin ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `faoi na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "i":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form =>
                startsVowel(form.value)
                  ? `in ${form.value}`
                  : `i ${mutate("ecl1x", form.value)}`
              ));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form =>
                startsVowel(form.value)
                  ? `in ${form.value}`
                  : `i ${mutate("ecl1x", form.value)}`
              ));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => {
                const txt = mutate("len3", form.value);
                return startsVowelFhx(txt)
                  ? `san ${txt}`
                  : `sa ${txt}`;
              }));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => {
                const txt = mutate(form.gender == "fem" ? "len3" : "len2", form.value);
                return startsVowelFhx(txt)
                  ? `san ${txt}`
                  : `sa ${txt}`;
              }));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `sna ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "le":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `le ${mutate("prefH", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `le ${mutate("prefH", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `leis an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `leis an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `leis na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "ó":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `ó ${mutate("len1", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `ó ${mutate("len1", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `ón ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `ón ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `ó na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "roimh":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `roimh ${mutate("len1", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `roimh ${mutate("len1", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `roimh an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `roimh an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `roimh na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "trí":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => `trí ${mutate("len1", form.value)}`));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => `trí ${mutate("len1", form.value)}`));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `tríd an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `tríd an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `trí na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      case "um":
        switch (formType) {
          case "sg":
            return ok(this.nounPhrase.forms.sgDat
              .map(form => {
                const txt = !startsBilabial(form.value)
                  ? mutate("len1", form.value)
                  : form.value;
                return `um ${txt}`;
              }));
          case "pl":
            return ok(this.nounPhrase.forms.plDat
              .map(form => {
                const txt = !startsBilabial(form.value)
                  ? mutate("len1", form.value)
                  : form.value;
                return `um ${txt}`;
              }));
          case "sgArtN":
            return ok(this.nounPhrase.forms.sgDatArtN
              .map(form => `um an ${mutate("len3", form.value)}`));
          case "sgArtS":
            return ok(this.nounPhrase.forms.sgDatArtS
              .map(form => `um an ${mutate(form.gender == "fem" ? "ecl3" : "ecl2", form.value)}`));
          case "plArt":
            return ok(this.nounPhrase.forms.plDatArt
              .map(form => `um na ${mutate("prefH", form.value)}`));
          default:
            return err(new Error(`Invalid form type: ${formType}`));
        }
      default:
        return err(new Error(`Unsupported preposition: ${this.preposition.getLemma()}`));
    }
  }
}
