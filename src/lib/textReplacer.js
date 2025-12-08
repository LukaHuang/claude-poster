/**
 * 文字替換功能
 * 允許用戶自定義替換規則
 */

// 網址正則表達式 (包含 http, https, ftp 等協議，以及 www 開頭的網址)
// 排除結尾的標點符號 (.!?,;:) 除非它們後面還有網址字符
// 使用函數返回新實例避免 lastIndex 問題
const getUrlRegex = () => /(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>"{}|\\^`[\]]*[^\s<>"{}|\\^`[\].!?,;:。！？，；：]/gi;

// Email 正則表達式
const getEmailRegex = () => /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// 數字格式正則表達式 (包含千分位逗號、小數點、百分比等)
// 匹配: 30,000 / 1,234,567 / 3.14 / 99.99% / $1,000.00 / -123,456.78
const getNumberRegex = () => /[$￥€£]?-?\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|\d+\.\d+%?/g;

/**
 * 執行文字替換
 * @param {string} text - 原始文本
 * @param {Array<{from: string, to: string}>} rules - 替換規則陣列
 * @param {Object} options - 選項
 * @param {boolean} options.preserveUrls - 是否保留網址中的符號不被替換
 * @param {boolean} options.preserveEmails - 是否保留 email 中的符號不被替換
 * @param {boolean} options.preserveNumbers - 是否保留數字格式中的符號不被替換
 * @returns {string} - 替換後的文本
 */
export function replaceText(text, rules, options = {}) {
  if (!text || !rules || rules.length === 0) return text;

  const { preserveUrls = false, preserveEmails = false, preserveNumbers = false } = options;

  // 如果需要保護網址、email 或數字
  if (preserveUrls || preserveEmails || preserveNumbers) {
    return replaceTextWithProtection(text, rules, preserveUrls, preserveEmails, preserveNumbers);
  }

  let result = text;

  // 依序執行每個替換規則
  rules.forEach(rule => {
    if (rule.from && rule.to !== undefined) {
      // 使用全局替換
      const regex = new RegExp(escapeRegExp(rule.from), 'g');
      result = result.replace(regex, rule.to);
    }
  });

  return result;
}

/**
 * 執行文字替換，但保護網址、email 和數字
 * @param {string} text - 原始文本
 * @param {Array<{from: string, to: string}>} rules - 替換規則陣列
 * @param {boolean} preserveUrls - 是否保留網址
 * @param {boolean} preserveEmails - 是否保留 email
 * @param {boolean} preserveNumbers - 是否保留數字格式
 * @returns {string} - 替換後的文本
 */
function replaceTextWithProtection(text, rules, preserveUrls, preserveEmails, preserveNumbers) {
  // 用於儲存被保護的片段
  const protectedSegments = [];
  let protectedText = text;

  // 建立一個唯一的佔位符（使用字母而非數字避免被數字正則匹配）
  const placeholderPrefix = '\x00\x01PROTECTED_';
  const placeholderSuffix = '\x01\x00';

  // 使用字母索引避免被數字正則匹配
  const indexToAlpha = (n) => {
    let result = '';
    do {
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return result;
  };

  const createPlaceholder = (index) => `${placeholderPrefix}${indexToAlpha(index)}${placeholderSuffix}`;

  // 保護網址
  if (preserveUrls) {
    protectedText = protectedText.replace(getUrlRegex(), (match) => {
      const index = protectedSegments.length;
      protectedSegments.push(match);
      return createPlaceholder(index);
    });
  }

  // 保護 email
  if (preserveEmails) {
    protectedText = protectedText.replace(getEmailRegex(), (match) => {
      const index = protectedSegments.length;
      protectedSegments.push(match);
      return createPlaceholder(index);
    });
  }

  // 保護數字格式
  if (preserveNumbers) {
    protectedText = protectedText.replace(getNumberRegex(), (match) => {
      const index = protectedSegments.length;
      protectedSegments.push(match);
      return createPlaceholder(index);
    });
  }

  // 執行替換規則
  let result = protectedText;
  rules.forEach(rule => {
    if (rule.from && rule.to !== undefined) {
      const regex = new RegExp(escapeRegExp(rule.from), 'g');
      result = result.replace(regex, rule.to);
    }
  });

  // 還原被保護的片段
  protectedSegments.forEach((segment, index) => {
    result = result.split(createPlaceholder(index)).join(segment);
  });

  return result;
}

/**
 * 轉義正則表達式特殊字符
 * @param {string} string - 要轉義的字串
 * @returns {string} - 轉義後的字串
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 驗證替換規則
 * @param {Array<{from: string, to: string}>} rules - 替換規則陣列
 * @returns {{valid: boolean, errors: Array<string>}} - 驗證結果
 */
export function validateRules(rules) {
  const errors = [];

  if (!Array.isArray(rules)) {
    errors.push('規則必須是陣列');
    return { valid: false, errors };
  }

  rules.forEach((rule, index) => {
    if (!rule.from) {
      errors.push(`規則 ${index + 1}: 缺少 "from" 欄位`);
    }
    if (rule.to === undefined) {
      errors.push(`規則 ${index + 1}: 缺少 "to" 欄位`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 預設替換規則範例
 */
export const DEFAULT_RULES = [
  { from: ', ', to: '，' },  // 英文逗號+空白轉中文逗號
  { from: '.', to: '。' },  // 英文句號轉中文句號
  { from: '!', to: '！' },  // 英文驚嘆號轉中文驚嘆號
  { from: '?', to: '？' },  // 英文問號轉中文問號
  { from: '-', to: '•' },   // 連字號轉項目符號
];
