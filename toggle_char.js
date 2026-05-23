let alternating = true

const isLetter = (char) => {
  const asciiValue = char.charCodeAt(0); 
  return (asciiValue >= 65 && asciiValue <= 90) || (asciiValue >= 97 && asciiValue <= 122);
}

const caseDetection = (char) => {
  const asciiValue = char.charCodeAt(0); 
  return (asciiValue >= 65 && asciiValue <= 90) ? 'upperCase' : 'lowerCase';
};

const toggleCase = (char, c) => {
  const asciiValue = char.charCodeAt(0);
  return c === 'upperCase' ? String.fromCharCode(asciiValue + 32) : String.fromCharCode(asciiValue - 32);
};

const toggleChar = (str, isAlternating) => {
  let result = '';

  if (isAlternating) {
    let count = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (!isLetter(char)) {
        result += char;
      } else {
        if (count % 2 === 0) {
          if (caseDetection(char) === 'upperCase') {
            result += char;
          } else {
            result += toggleCase(char, 'lowerCase');
          }
        } else {
          if (caseDetection(char) === 'lowerCase') {
            result += char;
          } else {
            result += toggleCase(char, 'upperCase');
          }
        }

        count += 1;
      }
    }

    return result;
  }
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const c = caseDetection(char);
    result += isLetter(char) ? toggleCase(char, c) : char;
  }

  return result;
}

console.log(toggleChar("Hello, world!"));
// "hELLO, WORLD!"

console.log(toggleChar("HeheHeheHEheheHeH"));
// "hEHEhEHEheHEHEhEh"

console.log(toggleChar("This will be alternated", alternating));
// "ThIs WiLl Be AlTeRnAtEd"