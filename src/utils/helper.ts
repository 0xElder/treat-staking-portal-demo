export const getMaskedValue = value => {
    if (!value) return;
    const unmaskedElementCountPre = 9;
    const unmaskedElementCountPost = 4;
    const unmaskedBeginning = value.slice(0, unmaskedElementCountPre);
    const unmaskedEnd = value.slice(-unmaskedElementCountPost);
    return `${unmaskedBeginning}...${unmaskedEnd}`;
};

// convert 10000 to 10k, 1000000 to 1m and limit decimals
export const formatNumber = (num, digits) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(digits)}m`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(digits)}k`;
    }

    // return num with decimal places
    return Number(num).toFixed(digits);
};
