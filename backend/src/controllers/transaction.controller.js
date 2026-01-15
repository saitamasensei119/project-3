exports.createTransaction = (req, res) => {
  res.json({ message: "create transaction" });
};

exports.getTransactions = (req, res) => {
  res.json({ message: "get transactions" });
};

exports.getTransactionById = (req, res) => {
  res.json({ message: "get transaction by id" });
};

exports.updateTransaction = (req, res) => {
  res.json({ message: "update transaction" });
};

exports.deleteTransaction = (req, res) => {
  res.json({ message: "delete transaction" });
};
