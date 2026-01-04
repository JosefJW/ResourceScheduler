using ResourceScheduler.Data;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure Swagger middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // defaults to /swagger
}

app.UseHttpsRedirection();

// Map endpoints
app.MapUserEndpoints();
app.MapFamilyEndpoints();
app.MapItemEndpoints();
app.MapReservationEndpoints();

app.Run();