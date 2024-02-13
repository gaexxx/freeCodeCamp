function rot13(str) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let parola = "";

  for (const char of str) {
    if (char.match(/\s|[!?.]/)) {
      parola += char;
    } else if (alphabet[alphabet.indexOf(char) + 13] == undefined) {
      parola += alphabet[alphabet.indexOf(char) - 13];
    } else {
      parola += alphabet[alphabet.indexOf(char) + 13];
    }
  }
  return parola;
}

console.log(rot13("SERR PBQR PNZC"));
console.log(rot13("SERR CVMMN!"));
console.log(rot13("SERR YBIR?"));
console.log(rot13("GUR DHVPX OEBJA SBK WHZCF BIRE GUR YNML QBT."));
