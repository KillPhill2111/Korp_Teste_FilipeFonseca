using Microsoft.EntityFrameworkCore;
using ServicoEstoque.Data;
using ServicoEstoque.Models;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<EstoqueDbContext>(options=>
    options.UseSqlite("Data Source=estoque.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app=builder.Build();

app.UseCors("PermitirAngular");


app.MapGet("/api/produtos", async(EstoqueDbContext db) =>
{
    return Results.Ok(await db.Produtos.ToListAsync());
});


app.MapPost("/api/produtos",async(Produto produto, EstoqueDbContext db) =>
{
    if (string.IsNullOrEmpty(produto.Codigo)|| string.IsNullOrEmpty(produto.Descricao))
    {
        return Results.BadRequest("Codigo e descrição são obrigatorios");
    }
    db.Produtos.Add(produto);
    await db.SaveChangesAsync();
    return Results.Created($"/api/produtos/{produto.Id}",produto);
});

app.MapPut("/api/produtos/atualizar-saldo",async (string codigo, int quantidade, EstoqueDbContext db) =>
{
    var produto=await db.Produtos.FirstOrDefaultAsync(p=>p.Codigo==codigo);

    if(produto==null) return Results.NotFound("Produto não encontrado");

    produto.Saldo=quantidade;
    await db.SaveChangesAsync();
    return Results.Ok(produto);
});

using(var scope = app.Services.CreateScope())
{
    var db=scope.ServiceProvider.GetRequiredService<EstoqueDbContext>();
    db.Database.EnsureCreated();
}

app.Run("http://localhost:5100");