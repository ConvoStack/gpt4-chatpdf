import { v4 } from "uuid";
import { VectorStore } from "./base.js";
import { Document } from "../document.js";
import { flattenObject } from "../util/flatten.js";
export class WeaviateStore extends VectorStore {
    constructor(embeddings, args) {
        super(embeddings, args);
        Object.defineProperty(this, "embeddings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: embeddings
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "indexName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queryAttrs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = args.client;
        this.indexName = args.indexName;
        this.textKey = args.textKey || "text";
        this.queryAttrs = [this.textKey];
        if (args.metadataKeys) {
            this.queryAttrs = this.queryAttrs.concat(args.metadataKeys);
        }
    }
    async addVectors(vectors, documents) {
        const batch = documents.map((document, index) => {
            if (Object.hasOwn(document.metadata, "id"))
                throw new Error("Document inserted to Weaviate vectorstore should not have `id` in their metadata.");
            const flattenedMetadata = flattenObject(document.metadata);
            return {
                class: this.indexName,
                id: v4(),
                vector: vectors[index],
                properties: {
                    [this.textKey]: document.pageContent,
                    ...flattenedMetadata,
                },
            };
        });
        try {
            await this.client.batch
                .objectsBatcher()
                .withObjects(...batch)
                .do();
        }
        catch (e) {
            throw Error(`'Error in addDocuments' ${e}`);
        }
    }
    async addDocuments(documents) {
        return this.addVectors(await this.embeddings.embedDocuments(documents.map((d) => d.pageContent)), documents);
    }
    async similaritySearchVectorWithScore(query, k, filter) {
        try {
            let builder = await this.client.graphql
                .get()
                .withClassName(this.indexName)
                .withFields(`${this.queryAttrs.join(" ")} _additional { distance }`)
                .withNearVector({
                vector: query,
                distance: filter?.distance,
            })
                .withLimit(k);
            if (filter?.where) {
                builder = builder.withWhere(filter.where);
            }
            const result = await builder.do();
            const documents = [];
            for (const data of result.data.Get[this.indexName]) {
                const { [this.textKey]: text, _additional, ...rest } = data;
                documents.push([
                    new Document({
                        pageContent: text,
                        metadata: rest,
                    }),
                    _additional.distance,
                ]);
            }
            return documents;
        }
        catch (e) {
            throw Error(`'Error in similaritySearch' ${e}`);
        }
    }
    static fromTexts(texts, metadatas, embeddings, args) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        return WeaviateStore.fromDocuments(docs, embeddings, args);
    }
    static async fromDocuments(docs, embeddings, args) {
        const instance = new this(embeddings, args);
        await instance.addDocuments(docs);
        return instance;
    }
    static async fromExistingIndex(embeddings, args) {
        return new this(embeddings, args);
    }
}
