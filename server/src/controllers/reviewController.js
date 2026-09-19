
import Joi from 'joi';
import { Review } from '../models/Review.js';


// TODO: write a validation schema for create/update per README.md section 2.
export const createReviewSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string(),
  reviewedBy: Joi.string()
})

export const updateReviewSchema = Joi.object({
courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: Joi.string()

})

// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    
    const { courseCode } = req.query;
    const filter = courseCode ? { courseCode } : {};
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
    // TODO
     try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
    // TODO

    try {
    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({ error: 'courseCode query parameter is required' });
    }

    const [summary] = await Review.aggregate([
      { $match: { courseCode } },
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (!summary) {
      return res.json({ courseCode, averageRating: 0, reviewCount: 0 });
    }

    res.json({
      courseCode: summary._id,
      averageRating: Math.round(summary.averageRating * 10) / 10,
      reviewCount: summary.reviewCount,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    // TODO
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already reviewed this course' });
    }
    next(err)
          res.status(500).json({ error: 'Failed to create review' });

    
  }
}

// PATCH /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateReview(req, res, next) {
  try {
    // TODO
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
}
// DELETE /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
   try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
