/** Shorten an EVM address for display: 0x1234...abcd */
export function shortenEvmAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** Shorten a Tezos address for display: tz1Ab...xYz */
export function shortenTezosAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
