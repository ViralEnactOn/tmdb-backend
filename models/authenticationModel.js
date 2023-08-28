const db = require("../config/db");

const favorite_exist = () => {
  const favorite = db.schema.hasTable("user_favorite_movie");
  return favorite;
};

const user_exist = () => {
  const user = db.schema.hasTable("user_favorite_movie");
  return user;
};
const insert_favorite = async (userId) => {
  const user = await db("user_favorite_movie").insert({
    user_id: userId,
  });
  return user;
};

const check_user = async (email) => {
  const user = await db("user").where({ email: email }).first();
  return user;
};

const insert_user = async (name, email, hashedPassword, token) => {
  const user = await db("user").insert({
    name: name,
    email: email,
    password: hashedPassword,
    isVerified: false,
    token: token,
  });
  return user;
};

const login_user = async (email) => {
  const user = await db("user").where({ email: email }).first();
  return user;
};

const verify_user = async (id, token) => {
  const user = await db("user")
    .where({
      id: id,
      token: token,
      isVerified: false,
    })
    .first();
  return user;
};

const verified_user = async (id) => {
  const user = await db("user")
    .where({ id: id })
    .update({ isVerified: true, updated_at: db.fn.now() });
  return user;
};

const reset_user_password = async (id, token, hashedPassword) => {
  const user = await db("user")
    .where({ id: id, token: token })
    .update({ password: hashedPassword });
  return user;
};

module.exports = {
  favorite_exist,
  user_exist,
  insert_favorite,
  check_user,
  insert_user,
  login_user,
  verify_user,
  verified_user,
  reset_user_password,
};
