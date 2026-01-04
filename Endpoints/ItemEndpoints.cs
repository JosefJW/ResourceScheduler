using Microsoft.EntityFrameworkCore;
using ResourceScheduler.Data;
using ResourceScheduler.Models;

namespace ResourceScheduler.Endpoints;

public static class ItemEndpoints
{
	public static void MapItemEndpoints(this WebApplication app)
	{
		// Post
		// Create an item
		app.MapPost("/items", async (Item item, AppDbContext db) =>
		{
			db.Items.Add(item);
			await db.SaveChangesAsync();
			return Results.Created($"/items/{item.Id}", item);
		});

		// Get
		// Get all items from a family
		app.MapGet("/items/family/{familyId}", async (long familyId, AppDbContext db) =>
			await db.Items
				.Where(i => i.FamilyId == familyId)
				.ToListAsync());

		// Get
		// Get item by id
		app.MapGet("/items/{itemId}", async (long itemId, AppDbContext db) => 
			await db.Items.FirstOrDefaultAsync(i => i.Id == itemId));

		// Get
		// Get all items from a family of a specific type
		app.MapGet("/items/family/{familyId}/type/{type}", async (long familyId, string type, AppDbContext db) => 
			await db.Items
				.Where(i => i.FamilyId == familyId && string.Compare(i.Type, type) == 0)
				.ToListAsync());

		// Get
		// Get all item types from a family
		app.MapGet("/items/family/{familyId}/type", async (long familyId, AppDbContext db) =>
			await db.Items
				.Where(i => i.FamilyId == familyId)
				.Select(i => i.Type)
				.Distinct()
				.ToListAsync());

		// Put
		// Update item name, type, status
		app.MapPut("/items/{itemId}", async (long itemId, Item item, AppDbContext db) =>
		{
			var existingItem = await db.Items.FirstOrDefaultAsync(i => i.Id == itemId);

			if (existingItem != null)
			{
				existingItem.Name = item.Name;
				existingItem.Type = item.Type;
				existingItem.IsActive = item.IsActive;
				await db.SaveChangesAsync();
				return Results.Ok(existingItem);
			}
			else
			{
				return Results.NotFound();
			}
		});

		// Delete
		// Delete an item
		app.MapDelete("/items/{itemId}", async (long itemId, AppDbContext db) =>
		{
			var deleteItem = await db.Items.FirstOrDefaultAsync(i => i.Id == itemId);

			if (deleteItem != null)
			{
				db.Items.Remove(deleteItem);
				await db.SaveChangesAsync();
				return Results.Ok(deleteItem);
			}
			else
			{
				return Results.NotFound();
			}
		});
	}
}