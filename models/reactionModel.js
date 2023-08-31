const db = require("../config/db");


const find_record = async (id, movie_id) => {
  const reaction = await db("user_reaction").where({
    user_id: id,
    movie_id: movie_id,
  });
  return reaction;
};

const insert_record = async (id, movie_id, type) => {
  const reaction = await db("user_reaction").insert({
    movie_id: movie_id,
    user_id: id,
    reaction: type,
  });
  return reaction;
};

const update_record = async (id, movie_id, type) => {
  const reaction = await db("user_reaction")
    .where({
      user_id: id,
      movie_id: movie_id,
    })
    .update({ reaction: type, updated_at: db.fn.now() });
  return reaction;
};

const delete_record = async (id, movie_id) => {
  const reaction = await db("user_reaction")
    .where({ user_id: id, movie_id: movie_id })
    .update({
      isDeleted: true,
      updated_at: db.fn.now(),
    });
  return reaction;
};

module.exports = {
  find_record,
  insert_record,
  update_record,
  delete_record,
};
