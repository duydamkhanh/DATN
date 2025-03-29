import StarRatings from 'react-star-ratings';

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <StarRatings
      rating={rating}
      starRatedColor="#FFD700"
      starEmptyColor="#D3D3D3"
      numberOfStars={5}
      starDimension="16px"
      starSpacing="2px"
    />
  );
};

export default RatingStars;
