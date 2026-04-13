const validatePizza = (layers, rules) => {
  const dict = {};

  // firt we generate a dictionary from the rules that we will use to 
  // handle the presence of the ingredients in the right order
  // if we find an ingredient from the ruls, we take the ingredients that should
  // be after the current ingredient and put them in the dict root agian so we will evaluate
  // their presence too. That way we can validate the pizza in the same loop
  for (let i = 0; i < rules.length; i++) {
    if (!dict.hasOwnProperty(rules[i][0])) {
      dict[rules[i][0]] = [`${rules[i][1]}`];
    } else {
      dict[rules[i][0]].push(rules[i][1]);
    }
  }

  for (let i = 0; i < layers.length; i++) {
    if (dict[layers[i]]) {
      // take all the next ingredients list
      const nextIngredients = dict[layers[i]];

      // place them in the root if they dont exist already
      for (let ingredient of nextIngredients) {
        if (!dict.hasOwnProperty(ingredient)) {
          dict[ingredient] = [];
        }
      }

      // delete the item from the dict
      delete dict[layers[i]];
    }
  }

  // If there are no ingredients left in the dict it means the pizza is valid
  return Object.keys(dict).length === 0;
}


console.log(validatePizza(["dough", "sauce", "cheese", "pepperoni", "basil"], [
  ["sauce", "cheese"],
  ["cheese", "pepperoni"],
  ["dough", "basil"],
])); // True

console.log(validatePizza(["dough", "sauce", "cheese", "pepperoni", "basil"], [
  ["cheese", "pepperoni"],
  ["cheese", "sauce"],
]));  // False