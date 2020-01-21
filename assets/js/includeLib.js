console.log("includeLib.js is linked - reusable function library (other apps)"); // reusable function library (other apps) 

// will randomize [0 to x] positive int sequence, returns array (length.x+1) 
// used for creating an alternate index to randomize list orders  
function randomIndex(arrLength) {
    let randIndex = [];
    let unique = false;
    for (i = 0; i < arrLength; i++) {
        randIndex.push(Math.floor(Math.random() * arrLength));
        while (!unique) {  // loops until unique random is created
            unique = true;
            if (i > 0) { // skip first array element (always unique)
                for (k = 0; k < i; k++) {
                    if (randIndex[k] === randIndex[i]) { unique = false }
                }
            }
            if (!unique) { randIndex[i] = Math.floor(Math.random() * arrLength) }
        }
        unique = false;
    }
    return randIndex === null ? 0 : randIndex;
}

// weighted random algorithm
function rndWeighted(arrOfWeights) {
    var sumOfWeights = arrSum(arrOfWeights);
    var rnd = Math.floor(Math.random() * (sumOfWeights - 1));
    for (i = 0; i < arrOfWeights.length; i++) {
        if (rnd < arrOfWeights[i]) {
            return i; // weighted pick
        }
        rnd -= arrOfWeights[i] // reduces the rnd by weight unpicked and loops
    }
}

// returns numbers of vowels via regex
function getVowels(str) {
    var vowels = str.match(/[aeiou]/gi);
    return vowels === null ? 0 : vowels.length;
}


// returns number of words in a string via regex
function totalWords(str) {
    var words = str.split(/\W+/).length;
    return words === null ? 0 : words;
}

// returns total number of letters in a string via regex
function totalLetters(str) {
    var letters = str.replace(/\s+/g, '');
    return letters.length;
}

// returns just unique chars in string
function uniqueString(str) {
    str = str.replace(/\s+/g, ''); // clear whitespace via regex
    var uniqueStr = str.charAt(0); // load first char - always unique
    for (i = 1; i < str.length; i++) {
        if (!uniqueStr.includes(str.charAt(i))) {
            uniqueStr += str.charAt(i); // add to the string if unique
        }
    }
    return uniqueStr === null ? "" : uniqueStr;
}

// function for creating multi-dimensional arrays - SO, Matthew Crumley
// createArray(10, 2) = arr[10][2], createArray(10, 2, 2) = arr[10][2][2]
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }
    return arr;
}

// function to sum the values in an array
function arrSum(arr) {
    return arr.reduce(function (a, b) {
        return a + b
    }, 0);
}
