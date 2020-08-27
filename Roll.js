"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** A Roll of the dice */
class RollResult {
    /**
     * Rolls the given dice and organizes the results in a useful manner
     * @param rollString the string describing the roll
     * @param message the message that was sent to call the command
     */
    constructor(rollString, rolls, mod = 0, valid = true, message) {
        this.valid = true;
        if (!valid || !rolls || !rolls.length) {
            this.valid = false;
            return;
        }
        this.rollString = rollString;
        this.rolls = rolls;
        this.total = rolls.reduce((a, b) => a + b) + mod;
        this.mod = mod;
    }
    /**
     * Gets the verbose string representation of the result
     */
    toString() {
        if (!this.valid)
            return "Invalid roll";
        return `${this.rollString} => (${this.rolls.join(",")})${this.mod ? (this.mod > 0 ? "+" + this.mod : this.mod) : ""} = ${this.total}`;
    }
    /**
     * The the simple string representation of the result
     */
    toSimpleString() {
        return `${this.rollString}: ${this.total}`;
    }
}
exports.RollResult = RollResult;
class Roll {
    /**
     * Handles rolling a single die or dice roll
     * @param dieString The string representing the dice to roll
     */
    static one(dieString) {
        if (!dieString)
            dieString = "1d6";
        let individual = [];
        let mod;
        try {
            let number = parseInt(dieString.match(this.numRegex)[0], 10);
            let size = parseInt(dieString.match(this.sizeRegex)[0], 10);
            let modMatch = dieString.match(this.modRegex);
            mod = modMatch && modMatch.length > 0 ? parseInt(modMatch[0], 10) : 0;
            for (let x = 0; x < number; x++)
                individual.push(this.singleDie(size));
        }
        catch (error) {
            console.log(`Error: ${error.message}`);
            return new RollResult("", null, 0, false);
        }
        return new RollResult(dieString, individual, mod);
    }
    /**
     * Rolls a single die of the given size and returns the result
     * @param size The size of the die to be rolled
     */
    static singleDie(size = 6) {
        return Math.floor(Math.random() * size) + 1;
    }
}
exports.Roll = Roll;
Roll.dieRegex = /(\d+[dD]\d+[+-]?(?=\d+)\d+)(?=[, ]|$)|(\d+[dD]\d+)(?=[, ]|$)/g;
Roll.numRegex = /\d+(?=[dD])/g;
Roll.sizeRegex = /(?<=[dD])\d+/g;
Roll.modRegex = /(?<=[dD]\d+)[+-]\d+/g;
/**
 * Warps the results of a Roll
 */
/*export class RollResult {
    public readonly string: string;
    public readonly rolls: number[];
    public readonly total: number;

    constructor (string: string, rolls: number[]) {
        this.string = string;
        this.total = rolls.reduce((a,b) => a + b);
    }
}*/ 
