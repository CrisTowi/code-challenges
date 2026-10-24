import type { GhostwriterInput } from "./algorithm";

export const customInputs: Record<string, { input: GhostwriterInput; description?: string }> = {
  example1: {
    input: {
      word: "ghost"
    }
  },
  example2: {
    input: {
      word: "a#~b"
    }
  },
  example3: {
    input: {
      word: "ab~c#"
    }
  },
  example4: {
    input: {
      word: "BBB##O~"
    }
  },
  ghostlyMoan: {
    input: {
      word: "Bo~~~o#!"
    },
    description: "The ghost gets carried away echoing, then takes one 'o' back → \"Boooo!\""
  },
  trickOrTreat: {
    input: {
      word: "trick#####treat"
    },
    description: "Changes its mind: wipes out the whole trick and writes treat → \"treat\""
  },
  draculaTypo: {
    input: {
      word: "Draculx#a"
    },
    description: "Even the undead make typos → \"Dracula\""
  },
  spellingHalloween: {
    input: {
      word: "Hal~oween"
    },
    description: "One echo makes the double L → \"Halloween\""
  },
  pumpkinPatch: {
    input: {
      word: "pumpkn#in"
    },
    description: "Forgot the i, backs up, fixes it → \"pumpkin\""
  },
  bloodcurdlingScream: {
    input: {
      word: "A~#a~h~h~!"
    },
    description: "Echoes, an erase and more echoes build a scream → \"Aaahhhh!\""
  },
  zombieHorde: {
    input: {
      word: "zombie~#s"
    },
    description: "A stray echo, erased just in time → \"zombies\""
  },
  echoesOfNothing: {
    input: {
      word: "~~~#ghost"
    },
    description: "Echoes on an empty page copy nothing, and the ghost shrugs → \"ghost\""
  },
  restInPeace: {
    input: {
      word: "RIP#####"
    },
    description: "Erases more letters than were written, buried without a trace → \"\""
  },
};
