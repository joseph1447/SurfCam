export function validateJoinGroupInput({ group, password, userId }: any) {
  if (!group || !userId) throw new Error('Datos incompletos');
  if (!password) throw new Error('Contraseña requerida');
}

export function validateCreateGroupInput({ name, password, userId }: any) {
  if (!name || !password || !userId) throw new Error('Datos incompletos');
  if (typeof name !== 'string' || name.length < 2 || name.length > 64) throw new Error('Nombre de grupo inválido');
  if (typeof password !== 'string' || password.length < 6) throw new Error('Contraseña muy corta');
}

export function validateChangePasswordInput({ group, newPassword, userId }: any) {
  if (!group || !newPassword || !userId) throw new Error('Datos incompletos');
  if (typeof newPassword !== 'string' || newPassword.length < 6) throw new Error('Contraseña muy corta');
}

export function validateUserProfileInput({ username, instagram }: any) {
  if (username && (typeof username !== 'string' || username.length < 2 || username.length > 32)) {
    throw new Error('Nombre de usuario inválido');
  }
  if (instagram) {
    if (typeof instagram !== 'string' || instagram.length > 128 || !/^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/.test(instagram)) {
      throw new Error('Instagram inválido. Debe ser un link como https://instagram.com/usuario');
    }
  }
}

export function validateRegisterInput({ email, password }: any) {
  if (!email || typeof email !== 'string') throw new Error('Email requerido');
  if (password && typeof password !== 'string') throw new Error('Contraseña inválida');
}
