function telephoneCheck(str) {
  let replaced = str.replace(/[\D]+/g, "");
  if (str.indexOf("(") == -1 && str.indexOf(")") > -1) {
    return false;
  }
  if (str.indexOf("(") > -1 && str.indexOf(")") == -1) {
    return false;
  }
  if (replaced.length == 10) {
    if (/^\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/g.test(str)) {
      return true;
    }
  }
  if (replaced.length == 11) {
    // * spiegazione sotto. regex incluso nel if precedente diverso solo all'inizio
    if (/^1 ?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/g.test(str)) {
      return true;
    }
  }
  return false;
}
console.log(telephoneCheck("(555-555-5555")); // false
console.log(telephoneCheck("1 555)555-5555")); // false
console.log(telephoneCheck("-1 (757) 622-7382")); // false
console.log(telephoneCheck("(555)5(55?)-5555")); // false
