export function numberToLetter(number: number) {
    if (number < 1 || number > 26) return null;
    return String.fromCharCode(64 + number); // 'A' is char code 65
}