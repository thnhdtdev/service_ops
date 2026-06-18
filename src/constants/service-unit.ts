export const SERVICE_UNIT= {
    KG:"kg",
    PAIR: "đôi",
    PIECE: "cái",
    SET: "bộ"
} as const;

export const SERVICE_UNIT_LABEL = {
    kg:"kg",
    pair: "đôi",
    piece: "cái",
    set: "bộ"
} as const;

export type ServiceUnit = keyof typeof SERVICE_UNIT_LABEL;