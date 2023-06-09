# ChatPDF with ConvoStack 🤖

Inspired by mayooear's [gpt4-pdf-chatbot-langchain](https://github.com/mayooear/gpt4-pdf-chatbot-langchain) repository, we have integrated ConvoStack to create a chatGPT chatbot playground for multiple Large PDF files in more than 90% fewer lines of code.

[Join the discord if you have questions](https://discord.com/invite/gCGbAm9HXx)

[⭐ our repo to support ConvoStack as an open-source project](https://github.com/ConvoStack/convostack)

## Development

1. Run `npm install` to install all necessary dependencies.

2. Set up your `.env` file

- Copy `.env.example` into `.env`
  Your `.env` file should look like this:

```
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

PINECONE_INDEX_NAME=

```

- Visit [openai](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API keys and insert into your `.env` file.
- Visit [pinecone](https://pinecone.io/) to create and retrieve your API keys, and also retrieve your environment and index name from the dashboard.

3. In the `config` folder, replace the `PINECONE_NAME_SPACE` with a `namespace` where you'd like to store your embeddings on Pinecone when you run `npm run ingest`. This namespace will later be used for queries and retrieval.

## Convert your PDF files to embeddings

**This repo can load multiple PDF files**

1. Create a `docs` folder. Inside `docs` folder, add your pdf files or folders that contain pdf files.

2. Run the script `npm run ingest` to 'ingest' and embed your docs. If you run into errors troubleshoot below.

3. Check Pinecone dashboard to verify your namespace and vectors have been added.

4. In `src/index.ts`, change the `templates.qaPrompt` for your own usecase. Change `modelName` in `new OpenAI` to `gpt-4`, if you have access to `gpt-4` api. Please verify outside this repo that you have access to `gpt-4` api, otherwise the application will not work.

## Run the app

Once you've verified that the embeddings and content have been successfully added to your Pinecone, you can run the app `npm run dev` to launch the ConvoStack chatbot playground.

## Suport ConvoStack

Feel free to give our repo a ⭐ to support open-source AI projects: https://github.com/ConvoStack/convostack
