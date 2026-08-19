using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using ServicoFaturamento.Data;
using ServicoFaturamento.Models;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<FaturamentoDbContext>(options =>
    options.UseSqlite("Data Source=faturamento.db"));

builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod();
    });
});


var app=builder.Build();
app.UseCors("PermitirAngular");

app.MapGet("/api/notas",async(FaturamentoDbContext db) =>
{
    var notas=await db.NotasFiscais.Include(n=>n.Itens).ToListAsync();
    return Results.Ok(notas);
});

app.MapPost("/api/notas", async (NotaFiscal novaNota, FaturamentoDbContext db) =>
{
    int totalNotas= await db.NotasFiscais.CountAsync();
    novaNota.Numeracao=$"NF-{1001+totalNotas}";
    novaNota.Status="Aberta";

    db.NotasFiscais.Add(novaNota);
    await db.SaveChangesAsync();
    return Results.Created($"/api/notas/{novaNota.Id}",novaNota);
});


app.MapPut("/api/notas/{id}/imprimir", async (int id, FaturamentoDbContext db,IHttpClientFactory clientFactrory) =>
{
    var nota=await db.NotasFiscais.Include(n=>n.Itens).FirstOrDefaultAsync(n=>n.Id==id);

    if (nota==null) return Results.NotFound("Nota Fiscal não encontrada");
    if (nota.Status !="Aberta") return Results.BadRequest("Apenas notas abertas podem ser impressas!!");

    using var transacao=await db.Database.BeginTransactionAsync();


    try
    {
        nota.Status="Fechada";
        await db.SaveChangesAsync();

        var clientHttp=clientFactrory.CreateClient();

        foreach(var item in nota.Itens)
        {
            System.Console.WriteLine($"Tentando baixar o estoque. Produto {item.CodigoProduto}");
            var urlEstoque= $"http://localhost:5100/api/produtos/atualizar-saldo?codigo={item.CodigoProduto}&quantidadeSubtrair={item.Quantidade}";
            var respostaEstoque=await clientHttp.PutAsync(urlEstoque, null);

            System.Console.WriteLine($"Resposta do Estoque: {respostaEstoque.StatusCode}");

            if (!respostaEstoque.IsSuccessStatusCode)
            {
                throw new Exception("O microsserviço de Estoque rejeito a atualização ou encontrou um erro");
            }
        }
        await transacao.CommitAsync();
        return Results.Ok(nota);
    }
    catch (Exception ex)
    {
        await transacao.RollbackAsync();

        return Results.Json(new { erro=$"Falha de comunicação entre microsserviços: {ex.Message}"},statusCode:503);
    }
});

using (var scope = app.Services.CreateScope())
{
    var db= scope.ServiceProvider.GetRequiredService<FaturamentoDbContext>();
    db.Database.EnsureCreated();
}

app.Run("http://localhost:5200");