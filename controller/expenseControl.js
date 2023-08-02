const asyncHandler = require("express-async-handler");
const Expense = require("../models/expensesModel");
const User = require("../models/usermodels");

const getSumAmountPerType = (expenses) => {
  const amountpertype = new Map();

  expenses.forEach((expense) => {
    const typeofexp = expense.type;
    const amount = expense.amount;
    amountpertype.set(typeofexp, (amountpertype.get(typeofexp) || 0) + amount);
  });

  const result = [];
  for (const [type, totalAmount] of amountpertype.entries()) {
    result.push({ type, totalAmount });
  }
  return result;
};

const getTotal = (expenses) => {
  let total = 0;
  expenses.forEach((expense) => {
    total += parseInt(expense.amount);
  });
  return total;
};

function getTotalAmountPerDay(expenses) {
  const amountPerDayMap = new Map();

  expenses.forEach((expense) => {
    // Extract the date part (YYYY-MM-DD) from the createdAt field
    const createdAt = new Date(expense.createdAt).toString();
    // const date = createdAt.split("T")[0];
    const date = createdAt.split(" 00:00:00")[0];
    const amount = expense.amount;

    // Add the amount to the existing total for the date or initialize it
    amountPerDayMap.set(date, (amountPerDayMap.get(date) || 0) + amount);
  });

  const result = [];
  for (const [date, totalAmount] of amountPerDayMap.entries()) {
    result.push({ date, totalAmount });
  }

  return result;
}

function getcloneExpenses(expenses) {
  const result = [];
  expenses.forEach((expense) => {
    // Extract the date part (YYYY-MM-DD) from the createdAt field
    const createdAt = new Date(expense.createdAt).toString();
    // const date = createdAt.split("T")[0];
    const date = createdAt.split(" 00:00:00")[0];
    const amount = expense.amount;
    const type = expense.type;
    const description = expense.description;
    result.push({ date, amount, type, description });
  });

  return result;
}

const GetExpense = asyncHandler(async (req, res) => {
  let expenses;
    const endDate = new Date();
    // we want startdate to be 7 days ago from today
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    console.log(startDate, endDate);

    expenses = await Expense.find({
      user: req.user._id,
      createdAt: { $gt: startDate, $lt: endDate },
    });
  const clonedExpenses = getcloneExpenses(expenses);
  const dates = getTotalAmountPerDay(expenses);
  const returnobj = {
    dates: dates,
    expenses: clonedExpenses,
  };
  res.status(200).json(returnobj);
});

const GetReport = asyncHandler(async (req, res) => {
  console.log(req.body);
  const month = req.body.month;
  try {
    const year = 2023; // Replace with the desired year
    // January (0-based index, January is 0)
    // Get the first day of the month
    console.log(month);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);
    console.log(startDate, endDate);
    const expenses = await Expense.find({
      createdAt: { $gt: startDate, $lt: endDate },
      user: req.user._id,
    });
    const total = getTotal(expenses);
    const types = getSumAmountPerType(expenses);
    const dates = getTotalAmountPerDay(expenses);
    const clonedExpenses = getcloneExpenses(expenses);
    const strmonth = new Date(year, month, 1).toLocaleString("default", {
      month: "long",
    });
    console.log(strmonth);
    res
      .status(200)
      .render("trial", {
        total,
        dates,
        types,
        month: strmonth,
        year: year,
        expenses: clonedExpenses,
      });
  } catch (error) {
    throw new Error("Error in getting expenses");
  }
});

// Helper function to format expenses data for PDF

const SetExpense = asyncHandler(async (req, res) => {
  if (!req.body.type && !req.body.amount) {
    res.status(400);
    throw new Error("type/amount is required!");
  }
  const expense = await Expense.create({
    type: req.body.type,
    amount: req.body.amount,
    description: req.body.description,
    user: req.user._id,
  });
  res.status(200).json(expense);
});

const UpdateExpense = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "id is required!" });
  }
  const old_expense = await Expense.findById(req.params.id);
  if (!old_expense) {
    res.status(400);
    throw new Error("expense not found!");
  }
  if (!req.user) {
    res.status(401);
    throw new Error("user not found!");
  }
  if (old_expense.user.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error("user not authorized!");
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedExpense);
});

const DeleteExpense = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "id is required!" });
  }
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(400);
    throw new Error("expense not found!");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("user not found!");
  }
  if (expense.user.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error("user not authorized!");
  }

  await Expense.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  GetExpense,
  SetExpense,
  UpdateExpense,
  DeleteExpense,
  GetReport,
};
