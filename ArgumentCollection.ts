/**
 * A collection of arguments to be passed to a command
 * @todo Named arguments?
 */
export default class ArgumentCollection {

    private static readonly quoteRegex = /[^\\]"/g;
    private static readonly spaceRegex = /\s+/g;
    private static readonly spaceOrEndRegex = /\s+|$/g;
    private static readonly insideQuotesRegex = /^"(.*?[^\\](?="))/g;

    /**
     * The internal collection of arguments
     */
    private args: string[];

    /**
     * The total number of arguments in the collection
     */
    public readonly count: number;

    /**
     * Constructs a new argument collection from a string containing arguments
     */
    constructor (rawargs: string) {
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
    isEmpty (): boolean {
        return Object.keys(this.args).length == 0;
    }

    /**
     * Gets the argument at the given index
     * @param index The index of the argument to get
     */
    get (index: number): string | undefined {
        return this.args[index];
    }

    /**
     * Gets all the arguments in the collection
     */
    getAll (): string[] {
        return this.args;
    }

    /**
     * Gets a string with all the arguments in the collection joined by the given separator
     * @param separator A string used to separate one element of an array from the next 
     * in the resulting String. If omitted, the array elements are separated with a comma.
     */
    join (separator: string): string {
        return this.args.join(separator);
    }

    /**
     * Performs the specified action for each argument in the collection
     * @param callbackfn A function that accepts up to three arguments. 
     * forEach calls the callbackfn function one time for each element in the array.
     */
    forEach (callbackfn: (value: string, index: number, array: string[]) => void): void {
        this.args.forEach(callbackfn);
    }

    /**
     * Checks each of the arguments in the collection with the given 
     * test to make sure the collection is valid
     * @param test The test to be run on each element to check the vollection for validity
     */
    checkValidity (test: (currentArg: string, previousArg: string, index: number) => boolean): boolean {
        for (let i = 0; i < this.args.length; i++)
            if (!test(this.args[i], this.args[i - 1] || null, i))
                return false;

        return true;
    }

    /**
     * Checks to see if the collection contains the given argument
     * @param arg The argument to check for
     */
    includes (arg: string): boolean {
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
    map<T> (mapFunc: (arg: string) => T, condition?: (arg: string) => boolean): T[] {
        return this.args.filter(condition ? condition : () => true).map(mapFunc);
    }






    /**
     * Parses the given string into a collection of arguments to be passed to a command
     * @param rawargs The arg string to be parsed into an argument colletion
     */
    static parse (rawargs: string): ArgumentCollection {
        return new ArgumentCollection(rawargs);
    }
}