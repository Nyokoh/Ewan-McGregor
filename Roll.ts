import ArgumentCollection from "./ArgumentCollection";
import { Message } from "discord.js";

/** A Roll of the dice */
export class RollResult {

    public readonly rollString: string;
    public readonly total: number;
    public readonly rolls: number[]; 
    public readonly valid: boolean = true;
    private readonly mod: number;


    /**
     * Rolls the given dice and organizes the results in a useful manner
     * @param rollString the string describing the roll
     * @param message the message that was sent to call the command
     */
    constructor (rollString: string, rolls: number[], mod: number = 0, valid: boolean = true, message?: Message) {
        
        if (!valid || !rolls || !rolls.length){
            this.valid = false;
            return;
        }

        this.rollString = rollString;

        this.rolls = rolls;
        this.total = rolls.reduce((a,b) => a + b) + mod;
        this.mod = mod;
    }

    /**
     * Gets the verbose string representation of the result
     */
    toString (): string {
        if (!this.valid)
            return "Invalid roll";

        return `${this.rollString} => (${this.rolls.join(",")})${this.mod ? (this.mod > 0 ? "+" + this.mod : this.mod) : ""} = ${this.total}`
    }

    /**
     * The the simple string representation of the result
     */
    toSimpleString (): string {
        return `${this.rollString}: ${this.total}`;
    }
}



export class Roll {
    private static readonly dieRegex: RegExp = /(\d+[dD]\d+[+-]?(?=\d+)\d+)(?=[, ]|$)|(\d+[dD]\d+)(?=[, ]|$)/g;
    private static readonly numRegex: RegExp = /\d+(?=[dD])/g;
    private static readonly sizeRegex: RegExp = /(?<=[dD])\d+/g;
    private static readonly modRegex: RegExp = /(?<=[dD]\d+)[+-]\d+/g;

    /**
     * Handles rolling a single die or dice roll
     * @param dieString The string representing the dice to roll
     */
    static one (dieString?: string): RollResult {
        if (!dieString) 
            dieString = "1d6"

        let individual: number[] = [];
        let mod: number;

        try {
            let number = parseInt(dieString.match(this.numRegex)[0], 10);
            let size = parseInt(dieString.match(this.sizeRegex)[0], 10);
            let modMatch = dieString.match(this.modRegex);
            mod = modMatch && modMatch.length > 0 ? parseInt(modMatch[0], 10) : 0;
            
            for (let x = 0; x < number; x++)
                individual.push(this.singleDie(size));

        } catch (error) {
            console.log(`Error: ${error.message}`);

            return new RollResult("", null, 0, false);
        }
        
        return new RollResult(dieString, individual, mod);
    }

    /**
     * Rolls a single die of the given size and returns the result
     * @param size The size of the die to be rolled
     */
    static singleDie (size: number = 6): number {
        return Math.floor(Math.random() * size) + 1
    }
}

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