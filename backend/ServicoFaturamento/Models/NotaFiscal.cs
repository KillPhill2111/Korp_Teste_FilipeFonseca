using Microsoft.AspNetCore.Routing.Constraints;

namespace ServicoFaturamento.Models;

public class NotaFiscal
{
    public int Id{get;set;}
    public string Numeracao{get;set;}=string.Empty;
    public string Status {get;set;}="Aberta";


    public List<NotaFiscalItem> Itens{get;set;}=new();
}