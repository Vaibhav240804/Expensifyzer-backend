const router = require("express").Router();
const {GetExpense,SetExpense, UpdateExpense, DeleteExpense, GetReport} = require("../controller/expenseControl");
const protect = require("../middleware/authMiddleware");

router.route("/").get(protect,GetExpense).post(protect,SetExpense);
router.route("/:id").put(protect,UpdateExpense).delete(protect,DeleteExpense);
router.route("/getreport").post(protect,GetReport)

module.exports = router;
