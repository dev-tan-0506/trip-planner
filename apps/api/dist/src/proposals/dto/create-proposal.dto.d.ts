export declare enum ProposalType {
    ADD_ITEM = "ADD_ITEM",
    UPDATE_TIME = "UPDATE_TIME",
    UPDATE_LOCATION = "UPDATE_LOCATION",
    UPDATE_NOTE = "UPDATE_NOTE"
}
export declare class CreateProposalDto {
    type: ProposalType;
    targetItemId?: string;
    payload: Record<string, unknown>;
    baseVersion?: number;
}
