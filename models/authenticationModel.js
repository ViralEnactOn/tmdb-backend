const db = require("../config/db");

const get_user = async (email) => {
  const user = await db("user").where({ email: email }).first();
  return user;
};

const insert = async (name, email, hashedPassword) => {
  const user = await db("user").insert({
    name: name,
    email: email,
    password: hashedPassword,
    isVerified: false,
  });
  return user;
};

const login = async (email) => {
  const user = await db("user").where({ email: email }).first();
  return user;
};

const verify = async (decode) => {
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

const resetPassword = async (id, email, name, hashedPassword) => {
  const user = await db("user")
    .where({ id: id, name: name, email: email })
    .update({ password: hashedPassword, updated_at: db.fn.now() });
  return user;
};

module.exports = {
  get_user,
  insert,
  login,
  verify,
  resetPassword,
};
