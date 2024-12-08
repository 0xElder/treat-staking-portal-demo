export const getMaskedValue = value => {
    if (!value) return;
    const unmaskedElementCount = 4;
    const unmaskedBeginning = value.slice(0, unmaskedElementCount);
    const unmaskedEnd = value.slice(-unmaskedElementCount);
    return `${unmaskedBeginning}...${unmaskedEnd}`;
};
