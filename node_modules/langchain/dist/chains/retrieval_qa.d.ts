import { BaseChain, ChainInputs } from "./base.js";
import { BaseLLM } from "../llms/base.js";
import { SerializedVectorDBQAChain } from "./serde.js";
import { ChainValues, BaseRetriever } from "../schema/index.js";
import { CallbackManagerForChainRun } from "../callbacks/manager.js";
export type LoadValues = Record<string, any>;
export interface RetrievalQAChainInput extends Omit<ChainInputs, "memory"> {
    retriever: BaseRetriever;
    combineDocumentsChain: BaseChain;
    inputKey?: string;
    returnSourceDocuments?: boolean;
}
export declare class RetrievalQAChain extends BaseChain implements RetrievalQAChainInput {
    inputKey: string;
    get inputKeys(): string[];
    get outputKeys(): string[];
    retriever: BaseRetriever;
    combineDocumentsChain: BaseChain;
    returnSourceDocuments: boolean;
    constructor(fields: RetrievalQAChainInput);
    /** @ignore */
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    _chainType(): "retrieval_qa";
    static deserialize(_data: SerializedVectorDBQAChain, _values: LoadValues): Promise<RetrievalQAChain>;
    serialize(): SerializedVectorDBQAChain;
    static fromLLM(llm: BaseLLM, retriever: BaseRetriever, options?: Partial<Omit<RetrievalQAChainInput, "combineDocumentsChain" | "index">>): RetrievalQAChain;
}
