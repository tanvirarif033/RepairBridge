import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { reviewService, Review } from '../../../services/review.service';
import { 
  FiStar, FiClock, FiCheckCircle, FiRefreshCw, FiEye,
  FiLoader, FiInbox, FiUser, FiMessageCircle, FiEdit2,
  FiTrash2, FiCalendar
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Reviews: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const data = await reviewService.getMyReviews(token);
      setReviews(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewService.delete(token!, id);
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-2xl animate-pulse" />
        </div>
        <p className="mt-6 text-gray-500 font-medium">Loading your reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">
            {reviews.length} review{reviews.length > 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => fetchReviews(true)}
          disabled={isRefreshing}
          className={`p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <FiRefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

     
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Reviews Yet</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            You haven't written any reviews yet. Share your experience after your repair is completed.
          </p>
          <Link to="/my-requests" className="mt-6 btn-primary inline-flex items-center gap-2">
            View Your Requests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.repairRequest?.title || `Review #${review.id}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {review.repairRequest?.brand} • {review.repairRequest?.model}
                      </p>
                    </div>
                  </div>

                  {renderStars(review.rating)}

                  {review.comment && (
                    <p className="mt-2 text-gray-700 text-sm leading-relaxed">
                      "{review.comment}"
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {review.repairRequest?.status === 'COMPLETED' && (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <FiCheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/reviews/edit/${review.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Edit Review"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Review"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/my-requests/${review.repairRequestId}`}
                    className="btn-primary text-sm flex items-center gap-2 px-4 py-2"
                  >
                    <FiEye className="w-4 h-4" /> View Request
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;