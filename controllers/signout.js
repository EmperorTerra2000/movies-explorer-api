// удаление JWT из куки
module.exports.deleteCookie = (req, res) => {
  res.cookie('token', '', {
    maxAge: -1,
  });

  res.end();
};
