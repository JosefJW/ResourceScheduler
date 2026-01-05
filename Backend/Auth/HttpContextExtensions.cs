using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ResourceScheduler.Auth;

public static class HttpContextExtensions
{
    public static long? GetUserId(this HttpContext ctx)
    {
        var claim = ctx.User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim == null) return null;
        return long.TryParse(claim.Value, out var id) ? id : null;
    }
}