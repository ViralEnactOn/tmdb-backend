const db = require("../config/db");

const insert = async (id, movie_id, comment, parent_comment_id) => {
  const movie = await db("user_comment").insert({
    movie_id: movie_id,
    user_id: id,
    text: comment,
    parent_comment_id:
      parent_comment_id !== undefined ? parent_comment_id : null,
  });
  return movie;
};

module.exports = {
  insert,
};
