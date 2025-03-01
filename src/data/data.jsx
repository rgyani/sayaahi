import akaneAvatar from "../assets/akane.png";
import eliotAvatar from "../assets/eliot.png";
import emilyAvatar from "../assets/emily.png";
import joeAvatar from "../assets/joe.png";
import germanAvatar from "../assets/beard.png";
import gamerAvatar from "../assets/gamer.png";
import roboticAvatar from "../assets/bot.png";
import awsAvatar from "../assets/aws.png";
import redditAvatar from "../assets/reddit.png";

export const formalModel = {
    name: "Formal",
    avatar: akaneAvatar,
    info: "I will restructure your input to formal sentences",
    prompt: "[Voice and style guide: Rephrase the input, line by line, in a coherent, formal, precise and business tone paired with sophisticated vocabulary and grammar. Make sure to keep the meaning the same. Also make sure not to remove line separators between lines] ",
    results : 5
}; 

export const wordtuneModel = {
    name: "Formal",
    avatar: akaneAvatar,
    info: "I will restructure your input to formal sentences",
    prompt: "[Voice and style guide: Rephrase the following sentences, one by one, like wordtune]",
    results : 10
}; 

export const botModel = {
    name: "Bot",
    avatar: roboticAvatar,
    info: "Ask Me Anything",
    prompt: "",
    results : 10
};


export const casualModel = {
    name: "Casual",
    avatar: gamerAvatar,
    info: "I will restructure your input to casual sentences",
    prompt: "[Voice and style guide: Rephrase in a conversational, relatable style as if you were explaining something to a friend. Use natural language and phrasing that a real person would use in everyday conversation. Make sure to keep the meaning the same] ",
    results : 5
}; 

export const englishModel = {
    name: "Standard English",
    avatar: emilyAvatar,
    info: "I will restructure your input to proper English sentences",
    prompt: "Correct this to standard English",
    results : 1
};

export const toGermanModel = {
    name: "English to German",
    avatar: germanAvatar,
    info: "Convert English text to German",
    prompt: "Convert English To German",
    results : 1
};


export const toEnglishModel = {
    name: "German To English",
    avatar: eliotAvatar,
    info: "Convert German text to English",
    prompt: "Convert German to English",
    results : 1
};

export const awsModel = {
    name: "AWS",
    avatar: awsAvatar,
    info: "AWS Code generator",
    prompt: "Write python boto3 code for",
    results : 1
};

export const redditModel = {
    name: "Reddit",
    avatar: redditAvatar,
    info: "I will compose a reddit reply to a question",
    prompt: "[Voice and style guide: Compose a funny reply to this question asked on reddit ",
    results : 5
}; 


export const meModel = {
    name: "ME",
    avatar: joeAvatar
};

export const users = [
    wordtuneModel,
    casualModel,
    englishModel,
    toGermanModel,
    toEnglishModel,
    botModel,
    awsModel,
    redditModel
];