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

const fetch = async (movie_id) => {
  const movie = await db("user_comment")
    .select(
      "user_comment.id as user_comment_id",
      "user_comment.movie_id as user_comment_movie_id",
      "user_comment.parent_comment_id as user_comment_parent_comment_id",
      "user_comment.text as user_comment_text",
      "user.id as user_id",
      "user.name as user_name",
      "user.email as user_email"
    )
    .join("user", "user_comment.user_id", "user.id")
    .where({
      movie_id: movie_id,
    });
  return movie;
};

module.exports = {
  insert,
  fetch,
};
