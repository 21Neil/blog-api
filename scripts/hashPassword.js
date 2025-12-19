import bcryptjs from 'bcryptjs';

const main = async () => {
  const hashedPassword = await bcryptjs.hash(process.argv[2], 10);

  console.log(hashedPassword);
};

main();
