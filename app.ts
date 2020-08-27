import Discord = require("discord.js");
import Message = Discord.Message;
//import FileSystem = require("fs");
//import * as Utils from "./SpitballUtils"
//import UserCollection from "./UserCollection"
import ArgumentCollection from "./ArgumentCollection";
//import User from "./User";
import { Roll, RollResult } from "./Roll";
import { TextChannel } from "discord.js";
import { MessageEmbed } from "discord.js";

const client = new Discord.Client();
const token = 'NzQ3MjQzNTc0NDMyODkwOTE0.X0MCzw.fLNlPLaZIlaPiSKmkrtJ9RfhcTY';
const administrators = ["Nyokoh#9294"];
const greetingURL = "https://cdn.discordapp.com/attachments/742545738160013316/747374132550828042/200_2.gif";
const extraRollRegex = /(^\/roll )|(^\/r )/g;
const help = require("./help.json");
//const defaultLogErr = (err: any) => err && console.log(err);
let prefix = "!";





/** Setup to extend Message with a function to get an appropriate user identifier */
declare module "discord.js" {
    interface Message {
        getUserIdentifier: () => string,
        isFromAdmin: () => boolean
    }
}

/** Gets an appropriate identifier for the sender of the message */
Message.prototype.getUserIdentifier = function (this: Message): string {
    return this.author.tag;
}

/** Gets an appropriate identifier for the sender of the message */
Message.prototype.isFromAdmin = function (this: Message): boolean {
    return !!administrators.find(admin => this.author.tag == admin);
}

/** A function the handles a command */
interface CommandFunction{
    (message: Message, args: ArgumentCollection): Promise<void>
}

/** A collection of commands unique to the bot */
interface CommandCollection {
    [commandName: string]: CommandFunction
}







/** The collection of all users who are currently using the spitball machine */
//let users: UserCollection = new UserCollection();

init();









/**
 * Contains all the built-in commands for the bot
 */
const Commands: CommandCollection = {

    /** Rolls for battle traits */
    "bt": async (message: Message, args: ArgumentCollection): Promise<void> => {
        if (!args.count)
            message.reply(`Rolled for a Battle Trait: \`${Roll.singleDie()}\``);

        else {
            message.reply("```asciidoc\n=== Rolling for Battle Traits ===\n" + 
                            args.map(arg => `- ${arg}: ${Roll.singleDie()}`).join("\n") + "```");
        }

        message.delete();
    },

    /** Rolls for battle scars */
    "bs": async (message: Message, args: ArgumentCollection): Promise<void> => {
        message.reply("`!bs` has been removed as it was confusing to have both `!ooa` and `!bs`. Please use `!ooa` instead (`!? ooa` for help)");

        message.delete();
    },

    /** Rolls for battle traits */
    "ooa": async (message: Message, args: ArgumentCollection): Promise<void> => {
        if (!args.count)
            message.reply(`Rolled for an out of Action Test: \`${Roll.singleDie()}\``);

        else {
            let success: string[] = [];
            let fail: string[] = [];

            args.forEach(arg => {
                let roll = Roll.singleDie();

                if (roll == 1)
                    fail.push(`- ${arg} - Roll for Battle Scar: ${Roll.singleDie()}`);
                else
                    success.push("- " + arg);
            });

            let messageString = "";

            if (success.length)
                messageString += "```asciidoc\n=== Passed Out of Action Test ===\n" + success.join("\n") + "```";

            if (fail.length) 
                messageString += "```asciidoc\n[ Failed Out of Action Test ]\n" + fail.join("\n") + "```";

            message.reply(messageString);
        }

        message.delete();
    },
    

    /**
     * rolls a d6 or the given dice
     * ```md
     * 
     * usage: !roll [dice]
     * 
     * !roll                -- rolls 1d6
     * !roll 2d10           -- rolls 2d10
     * ```
     */
    "roll": async (message: Message, args: ArgumentCollection): Promise<void> => {
        
        if (args.count > 0) {
            let isSimple = args.includes("-s");

            if (args.count === 1) {
                await message.reply(isSimple ? "`" + Roll.one().toSimpleString() + "`" : 
                                                Roll.one(args.get(0)).toString());
            }

            else {
                await message.reply("```" +
                                args.map(arg => isSimple ? 
                                                    Roll.one(arg).toSimpleString() : 
                                                    Roll.one(arg).toString(), arg => arg.charAt(0) != "-")
                                        .join("\n") + "```");
            }
        }

        else 
            await message.reply("`" + Roll.one() + "`");

        message.delete();
    },

    /** Outputs help */
    "?": async (message:Message, args: ArgumentCollection): Promise<void> => {
        let embeddedMessage: MessageEmbed;

        if (!args.count)
            embeddedMessage = new MessageEmbed()
                                    .setColor("#11ff11")
                                    .setTitle("Ewan McGregor is here to help you!")
                                    .setFooter("!? [command] - for help with a specific command")
                                    .setDescription(help.map(cmd => cmd.simple).join(`
`));

        else {
            let searched: any[] = help.filter(msg => msg.name == args.get(0));

            if (!searched.length) {
                message.reply(`I couldn't find any help for !${args.get(0)} :c`);
                return;
            }

            embeddedMessage = new MessageEmbed()
                                    .setColor("#11ff11")
                                    .setTitle(`!${args.get(0)} - help`)
                                    .setDescription(searched[0].detailed);
        }
            
        message.reply(embeddedMessage);
        message.delete();
    },

    /**
     * Sets the current status of the bot
     */
    "!status": async (message: Message, args: ArgumentCollection): Promise<void> => {
        if (message.isFromAdmin()) {
            client.user.setPresence({ activity: { name: args.get(0) }, status: 'online' });
            message.reply(`my status has been changed to "${args.get(0)}".`);
        }

        else
            message.reply("your mind tricks do not work on a jedi. You do not have permission to change my status.");
            
        message.delete();
    },


    // Aliases
    "r": async (message: Message, args: ArgumentCollection): Promise<void> => Commands.roll(message, args),
}







/**
 * Initializes the bot by setting up handlers and logging in
 */
function init (): void {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
        client.user.setPresence(
            { activity: { name: 'as General Kenobi' }, status: 'online' }
        );
        
        // Load all saved user data for anyone who is currently logged in
        /*client.guilds.forEach((guild: any) => {
            /*guild.members.forEach(member => {
                if (!member.user.bot) 
                    loadUserData(member.user.tag);
            })
        });*/
    });

    // Handle users logging in or out
    client.on("presenceUpdate", (oldmemb, newmemb) => {
    });
    
    client.on('message', handleMessage);

    client.on('guildMemberAdd', member => {
        const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
        // Do nothing if the channel wasn't found on this server
        if (!channel) return;

        // Using a type guard to narrow down the correct type
        if (!((channel): channel is TextChannel => channel.type === 'text')(channel)) return;

        // Send the message
        channel.send(greetingURL);

        //member.guild.channels["617042029163053223"].send()//.channels.fetch("general").//.sendMessage()//.get('channelID').send("Welcome"); 
    });
    
    client.login(token);
}

/**
 * Checks to see if the message starts with the required prefix:
 *      if it finds the prefix, handle the command
 *      if it doesn't find the prefix, ignore the message
 * @param message The message to be handled based on whether or not the prefix is present
 */
async function handleMessage (message: Message): Promise<void> {

    // If the message only contains the prefix, we dont know what to do with it,
    // and it is almost certainly not something they are trying to spitball
    if (message.content == prefix)
        return;

    
    if (extraRollRegex.test(message.content)) {
        message.reply("Sidekick is no longer here! Please use !roll or !r to roll dice, or use !? to see what other useful things I can do!");
        message.delete();
    }

    //let user = users.get(message.getUserIdentifier());

    // Check the first character of the message for the prefix
    if (message.content.charAt(0) != prefix) {
        if (message.mentions.has(client.user))
            await message.reply("no u");
        return;
    }

    // If the bot gets to this point, then the prefix was provided,
    // so start parsing the message as a command

    // gets the command name by grabbing the first "word" from the message and removing the prefix
    const command = message.content.split(" ", 1)[0].slice(prefix.length).toLowerCase();
    // gets the arguments from the arg string after the command, if it exists
    const args = ArgumentCollection.parse(/^\S+\s*(.*)$/g.exec(message.content)[1]);

    if (!command) {
        //message.reply("You did not provide a command for me to run! :c");
        return;
    }

    if (Commands[command])
        await Commands[command](message, args);
}