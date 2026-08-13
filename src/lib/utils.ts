export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}
