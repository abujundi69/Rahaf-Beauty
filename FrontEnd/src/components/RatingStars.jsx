import { Star } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { formatDecimal, formatNumber } from "../utils/format.js";

export default function RatingStars({ rating, reviewCount, compact = false }) {
  const { t } = useLanguage();
  const hasReviews = Number(reviewCount) > 0;


  return (
    <div>

    </div>
  );
}
