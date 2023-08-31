const db = require("../config/db");

const insert = async (id, name, isPublic) => {
  const watch_list = await db("user_watch_list").insert({
    name: name,
    user_id: id,
    isPublic: isPublic,
  });
  return watch_list;
};

const update = async (id, user_id, name, isPublic) => {
  const watch_list = await db("user_watch_list")
    .where({ user_id: user_id, id: id })
    .update({
      name: name,
      isPublic: isPublic,
      updated_at: db.fn.now(),
    });
  return watch_list;
};

const remove = async (id, user_id) => {
  const watch_list = await db("user_watch_list")
    .where({ user_id: user_id, id: id })
    .update({
      isDeleted: true,
      updated_at: db.fn.now(),
    });
  return watch_list;
};

const fetch = async (id) => {
  const watch_list = await db
    .select(
      "user_watch_list.id as user_watch_list_id",
      "user_watch_list.name as user_watch_list_name",
      "user.id as user_id",
      "user.name as user_name",
      "user.email as user_email"
    )
    .where({ user_id: id, isDeleted: false })
    .from("user_watch_list")
    .join("user", "user_watch_list.user_id", "user.id");
  return watch_list;
};

const insertMovie = async (id, user_id, movie_id) => {
  const watch_list = await db("user_watch_list")
    .where({ id: id })
    .where({ user_id: user_id })
    .where({ isDeleted: false })
    .update({
      movies: db.raw(
        `JSON_ARRAY_APPEND(COALESCE(movies, JSON_ARRAY()), '$', ?)`,
        [movie_id]
      ),
      updated_at: db.fn.now(),
    });
  return watch_list;
};

const removeMovie = async (id, user_id, movie_id) => {
  const watch_list = await db("user_watch_list")
    .where("id", id)
    .where({ user_id: user_id })
    .update({
      movies: db.raw(
        `JSON_REMOVE(COALESCE(movies, '[]'), JSON_UNQUOTE(JSON_SEARCH(COALESCE(movies, '[]'), 'one', ?)))`,
        [movie_id]
      ),
      updated_at: db.fn.now(),
    });
  return watch_list;
};

const fetchMovie = async (user_id, watch_list_id, isPublic) => {
  const watch_list = await db("user_watch_list")
    .where({
      id: watch_list_id,
      user_id: user_id,
      isDeleted: false,
      isPublic: isPublic === "false" || false ? 0 : 1,
    })
    .first();
  return watch_list;
};

module.exports = {
  insert,
  update,
  remove,
  fetch,
  insertMovie,
  removeMovie,
  fetchMovie,
};
