export const sortIntegers = (arr: number[], increase = true) => {
    const result = Array.from(arr);
    return result.sort((a, b) => (increase ? Number(a) - Number(b) : Number(b) - Number(a)));
};
