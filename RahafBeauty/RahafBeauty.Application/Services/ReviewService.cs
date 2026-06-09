using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Services;

public sealed class ReviewService : ServiceBase, IReviewService
{
    public ReviewService(IApplicationDbContext db, ICurrentUserService currentUser)
        : base(db, currentUser)
    {
    }

    public async Task<PagedResult<ReviewDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = Db.ProductReviews
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto(r.Id, r.ProductId, r.UserId, r.User.FullName, r.Rating, r.Comment, r.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<ReviewDto>(items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<ReviewDto> CreateAsync(Guid productId, CreateReviewRequest request, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Rating(fields, nameof(request.Rating), request.Rating);
        ValidationHelper.ThrowIfInvalid(fields);

        var productExists = await Db.Products.AnyAsync(p => p.Id == productId && p.IsActive, cancellationToken);
        if (!productExists)
        {
            throw new KeyNotFoundException("المنتج غير موجود");
        }

        if (request.OrderId.HasValue)
        {
            var order = await Db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId.Value && o.UserId == user.Id, cancellationToken)
                ?? throw new KeyNotFoundException("الطلب غير موجود");

            if (order.Status != OrderStatus.Received || order.Items.All(i => i.ProductId != productId))
            {
                throw new AppValidationException("لا يمكن تقييم منتج غير مستلم ضمن هذا الطلب", new Dictionary<string, string[]>
                {
                    [nameof(request.OrderId)] = ["لا يمكن تقييم منتج غير مستلم ضمن هذا الطلب"]
                });
            }
        }

        var exists = await Db.ProductReviews.AnyAsync(
            r => r.ProductId == productId && r.UserId == user.Id && r.OrderId == request.OrderId,
            cancellationToken);

        if (exists)
        {
            throw new AppValidationException("تم إرسال تقييم لهذا المنتج مسبقا", new Dictionary<string, string[]>
            {
                ["review"] = ["تم إرسال تقييم لهذا المنتج مسبقا"]
            });
        }

        var review = new ProductReview
        {
            ProductId = productId,
            UserId = user.Id,
            OrderId = request.OrderId,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            IsApproved = true
        };

        Db.ProductReviews.Add(review);
        await Db.SaveChangesAsync(cancellationToken);
        return new ReviewDto(review.Id, productId, user.Id, user.FullName, review.Rating, review.Comment, review.CreatedAt);
    }
}
