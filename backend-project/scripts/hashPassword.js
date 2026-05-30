const bcrypt = require('bcryptjs');
const password = process.argv[2] || 'supplynet2026';
bcrypt.hash(password, 10).then((hash) => {
  console.log('Password:', password);
  console.log('Hash:', hash);
});
