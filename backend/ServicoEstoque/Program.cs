using Microsoft.EntityFrameworkCore;
using ServicoEstoque.Data;
using ServicoEstoque.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<EstoqueDbContext>(options =>
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

var app = builder.Build();

app.UseCors("PermitirAngular");


app.MapGet("/api/produtos", async (EstoqueDbContext db) =>
{
    return Results.Ok(await db.Produtos.ToListAsync());
});


app.MapPost("/api/produtos", async (Produto produto, EstoqueDbContext db) =>
{
    if (string.IsNullOrEmpty(produto.Codigo) || string.IsNullOrEmpty(produto.Descricao))
    {
        return Results.BadRequest("Codigo e descrição são obrigatorios");
    }
    db.Produtos.Add(produto);
    await db.SaveChangesAsync();
    return Results.Created($"/api/produtos/{produto.Id}", produto);
});


app.MapPut("/api/produtos/atualizar-saldo", async (string codigo, int quantidadeSubtrair, EstoqueDbContext db) =>
{
    var produto = await db.Produtos.FirstOrDefaultAsync(p => p.Codigo == codigo);

    if (produto == null) return Results.NotFound("Produto não encontrado");

    if (produto.Saldo < quantidadeSubtrair)
    {
        return Results.BadRequest("Saldo em estoque insuficiente para realizar a transação!");
    }
    produto.Saldo -= quantidadeSubtrair;
    await db.SaveChangesAsync();
    return Results.Ok(produto);
});


app.MapPost("/api/produtos/ia-sugerir-codigo", (SugestaoRequest requisicao) =>
{
    if (string.IsNullOrWhiteSpace(requisicao.Descricao))
    {   
        return Results.BadRequest("Descrição vazia");
    } 
    var termos = requisicao.Descricao.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    var prefixo = "PROD";
    var detalhes = new List<string>();
    
    foreach (var termo in termos)
    {
        var limpo = termo.ToUpper().Trim();

        if (limpo.Contains("ARROZ") || limpo.Contains("FEIJAO") || limpo.Contains("OLEO")) prefixo = "ALIM";
        else if (limpo.Contains("CAMISA") || limpo.Contains("CALCA") || limpo.Contains("TENIS")) prefixo = "VEST";
        else if (limpo.Contains("IPHONE") || limpo.Contains("NOTEBOOK") || limpo.Contains("TV")) prefixo = "ELET";
        
        if (limpo.Length >= 3 && limpo != "PARA" && limpo != "COM" && limpo != "DE")
        {
            detalhes.Add(limpo.Substring(0, 3));    
        }
    }
    var codigoSugerido = $"{prefixo}-{string.Join("-", detalhes.Take(3))}";

    return Results.Ok(new { codigoSugerido });
});


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EstoqueDbContext>();
    db.Database.EnsureCreated();
}


app.Run("http://localhost:5100");


public record SugestaoRequest(string Descricao);
