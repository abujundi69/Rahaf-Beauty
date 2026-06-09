using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize(Roles = "Customer")]
[Tags("Orders")]
public sealed class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var result = await _orderService.CreateOrderAsync(request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم إنشاء الطلب"));
    }

    [HttpGet("my")]
    public async Task<IActionResult> MyOrders(CancellationToken cancellationToken)
    {
        var result = await _orderService.GetMyOrdersAsync(cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orderService.GetMyOrderAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPost("{id:guid}/reorder")]
    public async Task<IActionResult> Reorder(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orderService.ReorderAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تمت إضافة المنتجات المتاحة إلى السلة"));
    }
}

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
[Tags("Admin Orders")]
public sealed class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public AdminOrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] AdminOrderQuery query, CancellationToken cancellationToken)
    {
        var result = await _orderService.GetAdminOrdersAsync(query, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orderService.GetAdminOrderAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(result));
    }

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var result = await _orderService.ApproveAsync(id, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم اعتماد الطلب"));
    }

    [HttpPut("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, RejectOrderRequest request, CancellationToken cancellationToken)
    {
        var result = await _orderService.RejectAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم رفض الطلب"));
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await _orderService.UpdateStatusAsync(id, request, cancellationToken);
        return Ok(ApiResponseFactory.Success(result, "تم تحديث حالة الطلب"));
    }
}
