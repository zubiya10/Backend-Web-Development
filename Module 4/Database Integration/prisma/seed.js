
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create the sample user required by the posts.
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Demo User',
    },
  });

  // Add the sample posts.
  const posts = [
    {
      id: 1,
      title: 'First post',
      body: 'The contract survives storage changes.',
      authorId: 1,
    },
    {
      id: 2,
      title: 'Second post',
      body: 'Migrations record database design.',
      authorId: 1,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        title: post.title,
        body: post.body,
        authorId: post.authorId,
      },
      create: post,
    });
  }

  console.log('Seed data added successfully!');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
