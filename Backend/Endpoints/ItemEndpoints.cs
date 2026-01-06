using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;
using ResourceScheduler.Auth;
using ResourceScheduler.Dtos;

namespace ResourceScheduler.Endpoints;

public static class ItemEndpoints
{
	// Helper function, normalizes strings for item types
	static string NormalizeType(string input)
	{
		if (string.IsNullOrWhiteSpace(input))
			return "";

		input = input.Trim();
		return char.ToUpper(input[0]) + input.Substring(1).ToLower();
	}




	public static void MapItemEndpoints(this WebApplication app)
	{
		// Post
		// Create an item
		app.MapPost("/items", async (CreateItem req, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure user is a member of the family that the item is in
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == req.FamilyId && fm.UserId == userId);
			if (!member) return Results.Forbid();

			// Create the item
			var item = new Item
			{
				Name = req.Name,
				Type = NormalizeType(req.Type),
				FamilyId = req.FamilyId
			};

			// Add the item
			db.Items.Add(item);
			await db.SaveChangesAsync();
			return Results.Created($"/items/{item.Id}", item);
		})
		.RequireAuthorization();



		// Get
		// Get all items from a family
		app.MapGet("/items/family/{familyId}", async (long familyId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the user is a member of the family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (!member) return Results.Forbid();

			// Get the items
			var items = await db.Items
				.Where(i => i.FamilyId == familyId)
				.Select(i => new
				{
					i.Id,
					i.Name,
					i.Type,
					i.IsActive
				})
				.OrderBy(i => i.Type)
				.ToListAsync();

			return Results.Ok(items);
		})
		.RequireAuthorization();



		// Get
		// Get item by id
		app.MapGet("/items/{itemId}", async (long itemId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Fetch the item along with its familyId
			var item = await db.Items
				.FirstOrDefaultAsync(i => i.Id == itemId);

			if (item == null) return Results.NotFound();

			// Check if user is a member of the item's family
			var isMember = await db.FamilyMemberships
				.AnyAsync(fm => fm.FamilyId == item.FamilyId && fm.UserId == userId.Value);
			if (!isMember) return Results.Forbid();

			// Return the item
			return Results.Ok(item);
		})
		.RequireAuthorization();



		// Get
		// Get all items from a family of a specific type
		app.MapGet("/items/family/{familyId}/type/{type}", async (long familyId, string type, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the user is a member of the family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (!member) return Results.Forbid();
			
			// Get the items
			var items = await db.Items
				.Where(i => i.FamilyId == familyId && i.Type == type)
				.Select(i => new
				{
					i.Id,
					i.Name,
					i.IsActive
				})
				.ToListAsync();

			return Results.Ok(items);
		})
		.RequireAuthorization();



		// Get
		// Get all item types from a family
		app.MapGet("/items/family/{familyId}/type", async (long familyId, AppDbContext db, HttpContext ctx) => {
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Ensure the user is a member of the family
			var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);
			if (!member) return Results.Forbid();

			// Get the items
			var items = await db.Items
				.Where(i => i.FamilyId == familyId)
				.Select(i => i.Type)
				.Distinct()
				.ToListAsync();
			return Results.Ok(items);
		})
		.RequireAuthorization();

		

		// Get
		// Get all item types from the user
		app.MapGet("/items/user/type", async (AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the familyId of the families the user is in
			var familyIds = await db.FamilyMemberships
				.Where(fm => fm.UserId == userId)
				.Select(fm => fm.FamilyId)
				.Distinct()
				.ToListAsync();

			// Get the item types from those families
			var types = await db.Items
				.Where(i => familyIds.Contains(i.FamilyId))
				.Select(i => i.Type)
				.Distinct()
				.OrderBy(type => type)
				.ToListAsync();

			return Results.Ok(types);
		})
		.RequireAuthorization();



		// Put
		// Update item name, type, status
		app.MapPut("/items/{itemId}", async (long itemId, Item item, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the item to update
			var existingItem = await db.Items.FirstOrDefaultAsync(i => i.Id == itemId);
			if (existingItem != null)
			{
				// Ensure the user is in the item's family
				var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == existingItem.FamilyId && fm.UserId == userId);
				if (!member) return Results.Forbid();

				// Update the item
				existingItem.Name = item.Name;
				existingItem.Type = NormalizeType(item.Type);
				existingItem.IsActive = item.IsActive;
				await db.SaveChangesAsync();
				return Results.Ok(existingItem);
			}
			else
			{
				return Results.NotFound();
			}
		})
		.RequireAuthorization();



		// Delete
		// Delete an item
		app.MapDelete("/items/{itemId}", async (long itemId, AppDbContext db, HttpContext ctx) =>
		{
			// Get the userId from the JWT
			var userId = HttpContextExtensions.GetUserId(ctx);
			if (userId == null) return Results.Unauthorized();

			// Get the item to delete
			var deleteItem = await db.Items.FirstOrDefaultAsync(i => i.Id == itemId);
			if (deleteItem != null)
			{
				// Ensure the user is in the item's family
				var member = await db.FamilyMemberships.AnyAsync(fm => fm.FamilyId == deleteItem.FamilyId && fm.UserId == userId);
				if (!member) return Results.Forbid();

				// Delete the item
				db.Items.Remove(deleteItem);
				await db.SaveChangesAsync();
				return Results.Ok(deleteItem);
			}
			else
			{
				return Results.NotFound();
			}
		})
		.RequireAuthorization();
	}
}