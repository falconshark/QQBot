const random = require('random');

const Common = {
    rollDice(diceNum, rollNum){
        const diceResults = [];
        for(let i = 0; i < diceNum; i++){
            const diceResult = random.int(1, rollNum);
            diceResults.push(diceResult);
        }
        return diceResults;
    },
    choose(options){
        const index = random.int(0, options.length -1);
        const result = options[index];
        return result;
    },
}
module.exports = Common;
