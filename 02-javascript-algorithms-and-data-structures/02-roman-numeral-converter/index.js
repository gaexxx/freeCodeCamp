function convertToRoman(num) {
  const conversion = [
    { val: 1000, romanNum: "M" },
    { val: 900, romanNum: "CM" },
    { val: 500, romanNum: "D" },
    { val: 400, romanNum: "CD" },
    { val: 100, romanNum: "C" },
    { val: 90, romanNum: "XC" },
    { val: 50, romanNum: "L" },
    { val: 40, romanNum: "XL" },
    { val: 10, romanNum: "X" },
    { val: 9, romanNum: "IX" },
    { val: 5, romanNum: "V" },
    { val: 4, romanNum: "IV" },
    { val: 1, romanNum: "I" },
  ];

  if (num == 0) {
    return "";
  }

  for (const entry of conversion) {
    if (num >= entry.val) {
      return entry.romanNum + convertToRoman(num - entry.val);
    }
  }
}
console.log(convertToRoman(78));
