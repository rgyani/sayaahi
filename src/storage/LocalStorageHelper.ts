import { ChatMessage, MessageContentType } from "@chatscope/use-chat";
import { users } from "../data/data";

const keyPrefix = 'string_dictionary_';

export const addConversation = (key: string, value: ChatMessage<MessageContentType>) => {
  let currentValues = JSON.parse(localStorage.getItem(keyPrefix + key) || "[]") || [];
  currentValues.push(value);
  localStorage.setItem(keyPrefix + key, JSON.stringify(currentValues));
}

export const getConversation = (key: string) => {
  return JSON.parse(localStorage.getItem(keyPrefix + key) || "[]");
}

export const hasConversation = (key: string) => {
  return localStorage.getItem(keyPrefix + key) !== null;
}

export const setLastConversation = (key: string) => {
  localStorage.setItem(keyPrefix + "last_conversation", key);
}

export const getLastConversation = () => {
  return localStorage.getItem(keyPrefix + "last_conversation") || users[0].name;
}
