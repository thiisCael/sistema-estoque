import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Token ausente' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // {id, role, nome}
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
