export const sortIntegers = (arr: number[], increase = true) => {
    return arr.sort((a, b) => (increase ? Number(a) - Number(b) : Number(b) - Number(a)));
};
