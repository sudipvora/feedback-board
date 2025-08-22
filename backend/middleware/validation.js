// Validation middleware for feedback submission
function validateFeedback(req, res, next) {
  const { name, message, rating } = req.body;

  // Check if all required fields are present
  if (!name || !message || rating === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      details: {
        name: !name ? 'Name is required' : null,
        message: !message ? 'Message is required' : null,
        rating: rating === undefined ? 'Rating is required' : null
      }
    });
  }

  // Validate name
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name must be a non-empty string'
    });
  }

  if (name.trim().length > 255) {
    return res.status(400).json({
      success: false,
      error: 'Name must be less than 255 characters'
    });
  }

  // Validate message
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Message must be a non-empty string'
    });
  }

  if (message.trim().length > 10000) {
    return res.status(400).json({
      success: false,
      error: 'Message must be less than 10,000 characters'
    });
  }

  // Validate rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Rating must be an integer between 1 and 5'
    });
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.message = message.trim();
  req.body.rating = parseInt(rating);

  next();
}

module.exports = {
  validateFeedback
}; 