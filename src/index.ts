import dotenv from "dotenv";

dotenv.config();

import { playground } from "convostack/playground";
import {
  IAgentContext,
  IAgentResponse,
  IAgentCallbacks,
} from "convostack/agent";
import { ConvoStackLangchainChatMessageHistory } from "convostack/langchain-memory";
import { OpenAI } from "langchain/llms/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { ConversationChain, LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";

// Welcome to the ConvoStack Quickstart walkthrough! To follow along in our docs: https://docs.convostack.ai/getting-started/

// To support ConvoStack as an open-source AI project, feel free to give our repo a ⭐ : https://github.com/ConvoStack/convostack

// Example 1: OpenAI Agent
// playground({
//   async reply(context: IAgentContext): Promise<IAgentResponse> {
//     // `humanMessage` is the content of each message the user sends via the chatbot playground.
//     let humanMessage = context.getHumanMessage().content;
//     // `agent` is the OpenAI agent we want to use to respond to each `humanMessage`
//     const agent = new OpenAI({ modelName: "gpt-3.5-turbo" });
//     // `call` is a simple string-in, string-out method for interacting with the OpenAI agent.
//     const resp = await agent.call(humanMessage);
//     // `resp` is the generated agent's response to the user's `humanMessage`
//     return {
//       content: resp,
//       contentType: "markdown",
//     };
//   },
// });

// Example 2: LLM Chain
// playground({
//   async reply(context: IAgentContext): Promise<IAgentResponse> {
//     // `humanMessage` is the content of each message the user sends via the chatbot playground.
//     let humanMessage = context.getHumanMessage().content;
//     // We can now construct an LLMChain from a ChatPromptTemplate and a chat model.
//     const chat = new ChatOpenAI({ streaming: true, temperature: 0 });
//     // Pre-prompt the agent to be a language translator
//     const chatPrompt = ChatPromptTemplate.fromPromptMessages([
//       SystemMessagePromptTemplate.fromTemplate(
//         "You are a helpful assistant that translates {input_language} to {output_language}."
//       ),
//       HumanMessagePromptTemplate.fromTemplate("{text}"),
//     ]);
//     const chain = new LLMChain({
//       prompt: chatPrompt,
//       llm: chat,
//     });

//     // `resp` is the response of the OpenAI LLM chain translating `humanMessage` from English to French.
//     const resp = await chain.call({
//       input_language: "English",
//       output_language: "French",
//       text: humanMessage,
//     });

//     return {
//       content: resp.text,
//       contentType: "markdown",
//     };
//   },
// });

// Example 3: LLM Chain With History
playground({
  async reply(
    context: IAgentContext,
    callbacks?: IAgentCallbacks
  ): Promise<IAgentResponse> {
    // `humanMessage` is the content of each message the user sends via the chatbot playground.
    let humanMessage = context.getHumanMessage().content;

    // Create a new OpenAI agent, with streaming
    const chat = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            // Stream tokens to ConvoStack
            callbacks?.onMessagePart({
              contentChunk: token,
            });
          },
        },
      ],
    });

    // Setup your prompts (note the placeholder for {history})
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "The following is a friendly conversation between a human and an AI."
      ),
      new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ]);

    // Setup the chain with a BufferMemory that pulls from the ConvoStack conversation history
    const chain = new ConversationChain({
      memory: new BufferMemory({
        // Use the ConvoStackLangchainChatMessageHistory class to prepare a Langchain-compatible version of the history
        chatHistory: new ConvoStackLangchainChatMessageHistory({
          // Pass the current conversation's message history for loading
          history: context.getHistory(),
        }),
        returnMessages: true,
        memoryKey: "history",
      }),
      prompt: chatPrompt,
      llm: chat,
    });

    // `resp` is the response of the OpenAI LLM chain to `humanMessage`, which was inputted on the ConvoStack playground.
    const resp = await chain.call({
      input: context.getHumanMessage().content,
    });

    // Send the final response to ConvoStack
    return {
      content: resp.response,
      contentType: "markdown",
    };
  },
});
