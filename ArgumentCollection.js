"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A collection of arguments to be passed to a command
 * @todo Named arguments?
 */
class ArgumentCollection {
    /**
     * Constructs a new argument collection from a string containing arguments
     */
    constructor(rawargs) {
        // Leading and trailing spaces might mess things up, so get it out of the way
        rawargs = rawargs.trim();
        if (rawargs) {
            let hasQuotes = rawargs.indexOf('"') >= 0;
            // If there aren't any quotes in the string, then we can shortcut to assuming
            // single-word arguments, rather than trying to parse the whole string
            if (!hasQuotes)
                this.args = rawargs.split(ArgumentCollection.spaceRegex);
            else {
                this.args = [];
                // loop through the raw string and pull args out one at a time
                while (rawargs) {
                    if (rawargs.charAt(0) == '"' && rawargs.search(ArgumentCollection.quoteRegex) > 0) {
                        let found = ArgumentCollection.insideQuotesRegex.exec(rawargs);
                        this.args.push(found[1]);
                        // have to reset the index for the regex, otherwise,
                        // it will start at the index where it last found the match
                        ArgumentCollection.insideQuotesRegex.lastIndex = 0;
                        // remove the arg we just parsed
                        // +2 because the regex finds the character before the quote
                        rawargs = rawargs.slice(rawargs.search(ArgumentCollection.quoteRegex) + 2).trim();
                        ArgumentCollection.quoteRegex.lastIndex = 0; // just to be sure
                    }
                    else {
                        this.args.push(rawargs.split(" ", 1)[0]);
                        // remove the arg we just parsed
                        rawargs = rawargs.slice(rawargs.search(ArgumentCollection.spaceOrEndRegex) + 1).trim();
                        ArgumentCollection.spaceOrEndRegex.lastIndex = 0; // just to be sure
                    }
                }
            }
        }
        else
            this.args = [];
        this.count = this.args.length;
    }
    /**
     * Gets whether or not the collection has any arguments
     */
    isEmpty() {
        return Object.keys(this.args).length == 0;
    }
    /**
     * Gets the argument at the given index
     * @param index The index of the argument to get
     */
    get(index) {
        return this.args[index];
    }
    /**
     * Gets all the arguments in the collection
     */
    getAll() {
        return this.args;
    }
    /**
     * Gets a string with all the arguments in the collection joined by the given separator
     * @param separator A string used to separate one element of an array from the next
     * in the resulting String. If omitted, the array elements are separated with a comma.
     */
    join(separator) {
        return this.args.join(separator);
    }
    /**
     * Performs the specified action for each argument in the collection
     * @param callbackfn A function that accepts up to three arguments.
     * forEach calls the callbackfn function one time for each element in the array.
     */
    forEach(callbackfn) {
        this.args.forEach(callbackfn);
    }
    /**
     * Checks each of the arguments in the collection with the given
     * test to make sure the collection is valid
     * @param test The test to be run on each element to check the vollection for validity
     */
    checkValidity(test) {
        for (let i = 0; i < this.args.length; i++)
            if (!test(this.args[i], this.args[i - 1] || null, i))
                return false;
        return true;
    }
    /**
     * Checks to see if the collection contains the given argument
     * @param arg The argument to check for
     */
    includes(arg) {
        for (let cur of this.args)
            if (cur == arg)
                return true;
        return false;
    }
    /**
     * Maps the arguments in the collection to values determined by the mapFunc
     * Optionally filtered by the condition function
     * @param mapFunc The callback to run for each of the arguments in the collection
     * @param condition The callback to be used to filter out arguments that we don't want mapped
     */
    map(mapFunc, condition) {
        return this.args.filter(condition ? condition : () => true).map(mapFunc);
    }
    /**
     * Parses the given string into a collection of arguments to be passed to a command
     * @param rawargs The arg string to be parsed into an argument colletion
     */
    static parse(rawargs) {
        return new ArgumentCollection(rawargs);
    }
}
exports.default = ArgumentCollection;
ArgumentCollection.quoteRegex = /[^\\]"/g;
ArgumentCollection.spaceRegex = /\s+/g;
ArgumentCollection.spaceOrEndRegex = /\s+|$/g;
ArgumentCollection.insideQuotesRegex = /^"(.*?[^\\](?="))/g;
