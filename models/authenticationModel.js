const db = require("../config/db");

const insert_favorite = async (userId) => {
  const user = await db("user_favorite_movie").insert({
    user_id: userId,
  });
  return user;
};

const get_user = async (email) => {
  const user = await db("user").where({ email: email }).first();
  return user;
};

const insert_user = async (name, email, hashedPassword) => {
  const user = await db("user").insert({
    name: name,
    email: email,
    password: hashedPassword,
    isVerified: false,
  });
  return user;
};

const login_user = async (email) => {
  const user = await db("user").where({ email: email }).first();
  return user;
};

const verify_user = async (decode) => {
  const user = await db("user")
    .where({
      id: decode.id,
      email: decode.email,
      name: decode.name,
      isVerified: false,
    })
    .update({
      isVerified: true,
      updated_at: db.fn.now(),
    });
  return user;
};

const reset_user_password = async (id, email, name, hashedPassword) => {
  const user = await db("user")
    .where({ id: id, name: name, email: email })
    .update({ password: hashedPassword, updated_at: db.fn.now() });
  return user;
};

module.exports = {
  insert_favorite,
  get_user,
  insert_user,
  login_user,
  verify_user,
  reset_user_password,
};
