const db = require("../config/db");

const insert = async (user, type, items) => {
  const existingRecord = await db("user_favorite_list")
    .where({ user_id: user.id })
    .first();

  if (existingRecord) {
    const updatedFavorite = await db("user_favorite_list")
      .where({ user_id: user.id })
      .update({
        type: type,
        items: db.raw(
          `JSON_ARRAY_APPEND(COALESCE(items, JSON_ARRAY()), '$', ?)`,
          [items]
        ),
        updated_at: db.fn.now(),
      });
    return updatedFavorite;
  } else {
    const newFavorite = await db("user_favorite_list").insert({
      user_id: user.id,
      type: type,
      items: db.raw(`JSON_ARRAY(?)`, [items]),
    });
    return newFavorite;
  }
};

const fetch = async (id) => {
  const favorite = await db("user_favorite_list")
    .where({ user_id: id })
    .first();
  return favorite;
};

const remove = async (id, favorite_list_id) => {
  const favorite = await db("user_favorite_list")
    .where({ user_id: id })
    .update({
      items: db.raw(
        `JSON_REMOVE(COALESCE(items, '[]'), JSON_UNQUOTE(JSON_SEARCH(COALESCE(items, '[]'), 'one', ?)))`,
        [favorite_list_id]
      ),
      updated_at: db.fn.now(),
    });
  return favorite;
};
module.exports = {
  insert,
  fetch,
  remove,
};
