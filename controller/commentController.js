const sendResponse = require("../config/responseUtil");
const { commentModel } = require("../models/index");

const insert = async (req, res) => {
  const { movie_id, comment, parent_comment_id } = req.body;
  console.log(req.body.parent_comment_id);

  await commentModel.insert(req.user.id, movie_id, comment, parent_comment_id);

  sendResponse(res, {
    commentId: "Comment inserted successfully",
  });
};

module.exports = {
  insert,
};
