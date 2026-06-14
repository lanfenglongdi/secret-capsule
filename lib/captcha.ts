/**
 * 简单的数学验证码生成和验证
 * 防止自动化脚本,无需第三方服务
 */

export interface CaptchaChallenge {
  question: string;
  answer: number;
  token: string; // 用于防止重放攻击
}

/**
 * 生成随机数学题
 */
export function generateCaptcha(): CaptchaChallenge {
  const operators = ['+', '-', '*'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let a: number, b: number, answer: number;
  
  switch (operator) {
    case '+':
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a - b;
      break;
    case '*':
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
    default:
      a = 1;
      b = 1;
      answer = 2;
  }
  
  const operatorSymbols: Record<string, string> = {
    '+': '+',
    '-': '−',
    '*': '×'
  };
  
  return {
    question: `${a} ${operatorSymbols[operator]} ${b} = ?`,
    answer,
    token: generateToken()
  };
}

/**
 * 验证答案
 */
export function verifyCaptcha(answer: number, correctAnswer: number): boolean {
  return answer === correctAnswer;
}

/**
 * 生成随机 token
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 将验证码数据编码为字符串(用于前端存储)
 */
export function encodeCaptcha(challenge: CaptchaChallenge): string {
  return btoa(JSON.stringify({
    q: challenge.question,
    a: challenge.answer,
    t: challenge.token
  }));
}

/**
 * 从字符串解码验证码数据
 */
export function decodeCaptcha(encoded: string): CaptchaChallenge | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    return {
      question: decoded.q,
      answer: decoded.a,
      token: decoded.t
    };
  } catch (e) {
    return null;
  }
}
