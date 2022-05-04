// удаление JWT из куки
module.exports.deleteCookie = (req, res) => {
  req.user = "";

  res.end();
};
