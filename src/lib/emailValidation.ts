// Email validation utility functions

// Basic email format validation using regex
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check for obvious fake emails
export function isObviousFakeEmail(email: string): boolean {
  const [localPart, domain] = email.split('@');
  
  // Check for very short local parts (likely fake)
  if (localPart.length <= 1) {
    return true;
  }
  
  // Check for obvious fake patterns
  const fakePatterns = [
    /^[a-z]$/i, // Single letter
    /^[0-9]$/, // Single number
    /^test$/i, // "test"
    /^admin$/i, // "admin"
    /^user$/i, // "user"
    /^demo$/i, // "demo"
    /^example$/i, // "example"
    /^fake$/i, // "fake"
    /^spam$/i, // "spam"
    /^bot$/i, // "bot"
    /^temp$/i, // "temp"
    /^tmp$/i, // "tmp"
    /^123$/i, // "123"
    /^abc$/i, // "abc"
    /^xyz$/i, // "xyz"
    /^qwe$/i, // "qwe"
    /^asd$/i, // "asd"
    /^zxc$/i, // "zxc"
    /^aaa$/i, // "aaa"
    /^bbb$/i, // "bbb"
    /^ccc$/i, // "ccc"
    /^ddd$/i, // "ddd"
    /^eee$/i, // "eee"
    /^fff$/i, // "fff"
    /^ggg$/i, // "ggg"
    /^hhh$/i, // "hhh"
    /^iii$/i, // "iii"
    /^jjj$/i, // "jjj"
    /^kkk$/i, // "kkk"
    /^lll$/i, // "lll"
    /^mmm$/i, // "mmm"
    /^nnn$/i, // "nnn"
    /^ooo$/i, // "ooo"
    /^ppp$/i, // "ppp"
    /^qqq$/i, // "qqq"
    /^rrr$/i, // "rrr"
    /^sss$/i, // "sss"
    /^ttt$/i, // "ttt"
    /^uuu$/i, // "uuu"
    /^vvv$/i, // "vvv"
    /^www$/i, // "www"
    /^xxx$/i, // "xxx"
    /^yyy$/i, // "yyy"
    /^zzz$/i, // "zzz"
  ];
  
  for (const pattern of fakePatterns) {
    if (pattern.test(localPart)) {
      return true;
    }
  }
  
  // Check for repeated characters (like aaa, bbb, etc.)
  if (localPart.length >= 3 && /^(.)\1+$/.test(localPart)) {
    return true;
  }
  
  // Check for sequential characters (like abc, 123, etc.)
  if (localPart.length >= 3) {
    const chars = localPart.split('');
    let sequential = true;
    for (let i = 1; i < chars.length; i++) {
      const prev = chars[i - 1].charCodeAt(0);
      const curr = chars[i].charCodeAt(0);
      if (curr !== prev + 1) {
        sequential = false;
        break;
      }
    }
    if (sequential) {
      return true;
    }
  }
  
  return false;
}

// Check if domain has valid DNS records
export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.org', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
      'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'getairmail.com',
      'mailnesia.com', 'maildrop.cc', 'yopmail.com', 'getnada.com',
      'mailinator.net', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
      'bccto.me', 'chacuo.net', 'dispostable.com', 'fakeinbox.com'
    ];

    if (disposableDomains.includes(domain.toLowerCase())) {
      return false;
    }

    // Check if domain has valid DNS records
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    
    return data.Status === 0 && data.Answer && data.Answer.length > 0;
  } catch (error) {
    console.error('Domain validation error:', error);
    return false;
  }
}

// Comprehensive email validation
export async function validateEmail(email: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  // Check if email is empty
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'El email es requerido'
    };
  }

  // Check email format
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido'
    };
  }

  // Check for obvious fake emails
  if (isObviousFakeEmail(email)) {
    return {
      isValid: false,
      error: 'El email parece ser falso o temporal'
    };
  }

  // Check email length
  if (email.length > 254) {
    return {
      isValid: false,
      error: 'El email es demasiado largo'
    };
  }

  // Check for common invalid patterns
  const invalidPatterns = [
    /^[^@]+$/, // No @ symbol
    /^@.+$/, // Starts with @
    /^.+@$/, // Ends with @
    /^.+@[^.]*$/, // No domain extension
    /^.+@\..+$/, // Domain starts with dot
    /^.+@.+\.$/, // Domain ends with dot
    /\.{2,}/, // Multiple consecutive dots
    /^\./, // Starts with dot
    /\.$/, // Ends with dot
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(email)) {
      return {
        isValid: false,
        error: 'Formato de email inválido'
      };
    }
  }

  // Check domain validation (async)
  try {
    const isDomainValid = await validateEmailDomain(email);
    if (!isDomainValid) {
      return {
        isValid: false,
        error: 'El dominio del email no es válido o no acepta correos'
      };
    }
  } catch (error) {
    // If domain validation fails, we'll still accept the email but log the error
    console.warn('Domain validation failed, accepting email:', error);
  }

  return {
    isValid: true
  };
}

// Client-side validation (without domain check for better UX)
export function validateEmailClient(email: string): {
  isValid: boolean;
  error?: string;
} {
  // Check if email is empty
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'El email es requerido'
    };
  }

  // Check email format
  if (!isValidEmailFormat(email)) {
    return {
      isValid: false,
      error: 'Formato de email inválido'
    };
  }

  // Check for obvious fake emails
  if (isObviousFakeEmail(email)) {
    return {
      isValid: false,
      error: 'El email parece ser falso o temporal'
    };
  }

  // Check email length
  if (email.length > 254) {
    return {
      isValid: false,
      error: 'El email es demasiado largo'
    };
  }

  // Check for common invalid patterns
  const invalidPatterns = [
    /^[^@]+$/, // No @ symbol
    /^@.+$/, // Starts with @
    /^.+@$/, // Ends with @
    /^.+@[^.]*$/, // No domain extension
    /^.+@\..+$/, // Domain starts with dot
    /^.+@.+\.$/, // Domain ends with dot
    /\.{2,}/, // Multiple consecutive dots
    /^\./, // Starts with dot
    /\.$/, // Ends with dot
  ];

  for (const pattern of invalidPatterns) {
    if (pattern.test(email)) {
      return {
        isValid: false,
        error: 'Formato de email inválido'
      };
    }
  }

  // Check for disposable email domains
  const domain = email.split('@')[1]?.toLowerCase();
  const disposableDomains = [
    'tempmail.org', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
    'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'getairmail.com',
    'mailnesia.com', 'maildrop.cc', 'yopmail.com', 'getnada.com',
    'mailinator.net', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
    'bccto.me', 'chacuo.net', 'dispostable.com', 'fakeinbox.com'
  ];

  if (domain && disposableDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'No se permiten emails temporales o desechables'
    };
  }

  return {
    isValid: true
  };
}
