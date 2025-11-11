
import bcrypt from 'bcryptjs';

const senha = process.argv[2] || '123456';
const rounds = 10;

bcrypt.hash(senha, rounds).then(hash => {
  console.log('hash:', hash);
}).catch(err => {
  console.error('Erro ao gerar hash:', err);
});
