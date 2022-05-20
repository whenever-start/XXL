/**
 * 判断 num 是否在 range中
 *
 * @param {number} num number
 * @param {[number,number]} range 范围
 * @example isInRange(1,[0,5]) => true
 * @example isInRange(-1,[0,5]) => false
 */
export default function isInRange(
  num: number,
  range: [number, number]
): boolean {
  return num >= range[0] && num <= range[1]
}
