export declare enum CreateVoteSessionMode {
    NEW_OPTION = "NEW_OPTION",
    REPLACE_ITEM = "REPLACE_ITEM"
}
export declare class CreateVoteSessionDto {
    mode: CreateVoteSessionMode;
    deadline: string;
    description?: string;
    targetItemId?: string;
    targetDayIndex?: number;
    targetInsertAfterItemId?: string;
}
