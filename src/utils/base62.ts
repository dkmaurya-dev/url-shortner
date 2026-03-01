const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function encodeBase62(num: number | bigint): string {
  let n = BigInt(num);
  if (n === 0n) return ALPHABET[0];
  let result = "";
  while (n > 0n) {
    result = ALPHABET[Number(n % 62n)] + result;
    n = n / 62n;
  }
  return result;
}

export function decodeBase62(str: string): bigint {
  let result = 0n;
  for (let i = 0; i < str.length; i++) {
    const index = ALPHABET.indexOf(str[i]);
    if (index === -1) throw new Error(`Invalid character in base62 string: ${str[i]}`);
    result = result * 62n + BigInt(index);
  }
  return result;
}
