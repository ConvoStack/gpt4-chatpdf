import dotenv from "dotenv";

dotenv.config();

import { playground } from "convostack/playground";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { IAgentContext, IAgentResponse } from "convostack/agent";
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "../config/pinecone";
import { templates } from "./templates";

playground({
  async reply(context: IAgentContext): Promise<IAgentResponse> {
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const llm = new OpenAI({});
    const question = context.getHumanMessage().content;
    try {
      // Build an LLM chain that will improve the user prompt
      const index = pinecone.Index(PINECONE_INDEX_NAME);

      /* create vectorstore*/
      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({}),
        {
          pineconeIndex: index,
          textKey: "text",
          namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
        }
      );

      //create chain
      const model = new OpenAI({
        temperature: 0, // increase temepreature to get more creative answers
        modelName: "gpt-3.5-turbo", //change this to gpt-4 if you have access
      });

      const chain = ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever(),
        {
          qaTemplate: templates.qaPrompt,
          questionGeneratorTemplate: templates.condensePrompt,
          returnSourceDocuments: true, //The number of source documents returned is 4 by default
        }
      );
      const history = context.getHistory().map((item) => item.content);

      //Ask a question using chat history
      const response = await chain.call({
        question: question,
        chat_history: history,
      });

      return {
        content: response.text,
        contentType: "markdown",
      };
    } catch (error) {
      console.log(error);
      return {
        content: "error",
        contentType: "markdown",
      };
    }
  },
});
