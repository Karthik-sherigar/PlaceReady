// @desc    Health check
// @route   GET /api/health
// @access  Public
const getHealth = (req, res) => {
  res.status(200).json({ status: "OK" });
};

module.exports = { getHealth };
