
const prisma = require('../lib/prisma');

async function findAll() {
  return prisma.post.findMany({
    orderBy: { id: 'asc' },
  });
}

async function findById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
  });
}

async function create(fields) {
  return prisma.post.create({
    data: {
      title: fields.title,
      body: fields.body || '',
      authorId: Number(fields.authorId),
    },
  });
}

async function update(id, patch) {
  const postId = Number(id);

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) return null;

  return prisma.post.update({
    where: { id: postId },
    data: {
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.body !== undefined && { body: patch.body }),
    },
  });
}

async function remove(id) {
  const postId = Number(id);

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) return false;

  await prisma.post.delete({
    where: { id: postId },
  });

  return true;
}

module.exports = { findAll, findById, create, update, remove };
