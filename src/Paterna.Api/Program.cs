using Paterna.Application;
using Paterna.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure();
builder.Services.AddSingleton<AuthService>();
builder.Services.AddSingleton<ProductService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/api/auth/signup", async (SignupRequest request, AuthService authService, CancellationToken cancellationToken) =>
{
    try
    {
        var result = await authService.SignupAsync(new SignupCommand(request.Name, request.Email, request.Password), cancellationToken);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { message = ex.Message });
    }
});

app.MapPost("/api/auth/login", async (LoginRequest request, AuthService authService, CancellationToken cancellationToken) =>
{
    try
    {
        var result = await authService.LoginAsync(new LoginCommand(request.Email, request.Password), cancellationToken);
        return Results.Ok(result);
    }
    catch (UnauthorizedAccessException ex)
    {
        return Results.Unauthorized();
    }
});

app.MapGet("/api/products", async (ProductService productService, CancellationToken cancellationToken) =>
{
    var products = await productService.GetProductsAsync(cancellationToken);
    return Results.Ok(products);
});

app.Run();

public sealed record SignupRequest(string Name, string Email, string Password);
public sealed record LoginRequest(string Email, string Password);
