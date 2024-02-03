function palindrome(str) {
  let replaced = str.toLowerCase().replace(/([-&>\"',:_(/).])|\s|[|]/g, "");
  let splitted = replaced.split("");
  let firstArray = [];
  let secondArray = [];

  if (splitted.length % 2 !== 0) {
    firstArray = splitted.slice(0, Math.floor(splitted.length / 2)).join("");
    secondArray = splitted
      .slice(Math.floor(splitted.length / 2 + 1))
      .reverse()
      .join("");
  }

  if (splitted.length % 2 == 0) {
    firstArray = splitted.slice(0, splitted.length / 2).join("");
    secondArray = splitted
      .slice(splitted.length / 2)
      .reverse()
      .join("");
  }

  if (firstArray == secondArray) {
    return true;
  } else {
    return false;
  }
}

console.log(palindrome("never odd or even"));
console.log(palindrome("My age is 0, 0 si ega ym."));
console.log(palindrome("0_0 (: /- :) 0-0"));
