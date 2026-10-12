
const postRepository = require('../repositories/postRepository');

async function listPosts() {
  return postRepository.findAll();
}

async function getPost(id) {
  return postRepository.findById(id);
}

async function createPost(fields) {
  if (!fields || !fields.title) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  try {
    return await postRepository.create({
      title: fields.title,
      body: fields.body || '',
      authorId: fields.authorId,
    });
  } catch (err) {
    if (err.code === 'P2003') {
      const error = new Error('The related record does not exist');
      error.statusCode = 409;
      throw error;
    }

    throw err;
  }
}

async function updatePost(id, patch) {
  return postRepository.update(id, patch);
}

async function removePost(id) {
  return postRepository.remove(id);
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  removePost,
};
