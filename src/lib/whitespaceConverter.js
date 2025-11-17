/**
 * 空白字元轉換器 - 模仿 piliapp 的功能
 * 在空格和換行符之間注入零寬度空格（zero-width space）
 * 用於規避社交媒體平台對多個連續空白的限制
 */

// 零寬度空格字元
const ZERO_WIDTH_SPACE = '\u200B';

/**
 * 轉換文本，在空格和換行符之間注入零寬度空格
 * @param {string} text - 原始文本
 * @returns {string} - 轉換後的文本
 */
export function convertWhitespace(text) {
  if (!text) return '';

  let result = text;

  // 在連續的空格之間插入零寬度空格
  // 例如：將 "  " 轉換為 " \u200B "
  result = result.replace(/ {2,}/g, (match) => {
    return match.split('').join(ZERO_WIDTH_SPACE);
  });

  // 在換行符之間插入零寬度空格
  // 這樣可以在貼到社交媒體時保留多個換行
  result = result.replace(/\n{2,}/g, (match) => {
    return match.split('').join(ZERO_WIDTH_SPACE);
  });

  return result;
}

/**
 * 移除文本中的零寬度空格
 * @param {string} text - 含有零寬度空格的文本
 * @returns {string} - 清理後的文本
 */
export function removeZeroWidthSpaces(text) {
  if (!text) return '';
  return text.replace(/\u200B/g, '');
}

/**
 * 檢查文本是否包含零寬度空格
 * @param {string} text - 要檢查的文本
 * @returns {boolean} - 是否包含零寬度空格
 */
export function hasZeroWidthSpaces(text) {
  if (!text) return false;
  return text.includes(ZERO_WIDTH_SPACE);
}

/**
 * 在每個空格後添加零寬度空格（用於增加視覺間距）
 * @param {string} text - 原始文本
 * @returns {string} - 轉換後的文本
 */
export function addSpacingAfterSpaces(text) {
  if (!text) return '';
  return text.replace(/ /g, ` ${ZERO_WIDTH_SPACE}`);
}

/**
 * 在每個換行後添加額外的換行（用於增加段落間距）
 * @param {string} text - 原始文本
 * @returns {string} - 轉換後的文本
 */
export function addExtraLineBreaks(text) {
  if (!text) return '';
  return text.replace(/\n/g, `\n${ZERO_WIDTH_SPACE}\n`);
}
