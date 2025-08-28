import bcryptjs from 'bcryptjs';
import prisma from '../src/utils/prisma.js'

const main = async () => {
  const username = 'admin';
  const password = 'blogadmin21';

  const hashedPassword = await bcryptjs.hash(password, 10);

  await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  console.log('User create success!');
};

main()
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
