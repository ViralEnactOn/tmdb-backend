const db = require("../config/db");

const find = async (id, movie_id) => {
  const reaction = await db("user_reaction").where({
    user_id: id,
    movie_id: movie_id,
  });
  return reaction;
};

const insert = async (id, movie_id, type) => {
  const reaction = await db("user_reaction").insert({
    movie_id: movie_id,
    user_id: id,
    reaction: type,
  });
  return reaction;
};

const update = async (id, movie_id, type) => {
  const reaction = await db("user_reaction")
    .where({
      user_id: id,
      movie_id: movie_id,
    })
    .update({ reaction: type, updated_at: db.fn.now() });
  return reaction;
};

const remove = async (id, movie_id) => {
  const reaction = await db("user_reaction")
    .where({ user_id: id, movie_id: movie_id })
    .update({
      isDeleted: true,
      updated_at: db.fn.now(),
    });
  return reaction;
};

module.exports = {
  find,
  insert,
  update,
  remove,
};
