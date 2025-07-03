export function numberToLetter(number: number) {
    if (number < 1 || number > 26) return null;
    return String.fromCharCode(64 + number); // 'A' is char code 65
}

export function isArraysEqual(arr1: any[], arr2: any[], strictOrder = false): boolean {
    if (arr1.length !== arr2.length) return false;

    if (arr1.length === 0 && arr2.length === 0) return false;

    if (strictOrder) {
        return arr1.every((val, index) => val === arr2[index]);
    }

    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, index) => val === sorted2[index]);
}