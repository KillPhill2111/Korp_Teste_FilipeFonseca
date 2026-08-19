import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule,Validators } from '@angular/forms'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cadastro-nota',
  standalone:true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './cadastro-nota.html',
  styleUrl: './cadastro-nota.css',
})
export class CadastroNota {
  private fb = inject(FormBuilder);
  private http=inject(HttpClient);
  // public notaForm: FormGroup;

  public notaForm:FormGroup;
  public processandoImpressao:boolean=false;
  public notaSendoProcessada:string | null=null;
  
  public produtosDisponiveis:any[]=[];
  public notasFiscaisCriadas:any[]=[];
  // public produtosDisponiveis = [
  //   { codigo: 'PROD-001', descricao: 'Arroz Integral 1kg', saldo: 10 },
  //   { codigo: 'PROD-002', descricao: 'Feijão Carioca 1kg', saldo: 15 },
  //   { codigo: 'PROD-003', descricao: 'Óleo de Soja 900ml', saldo: 5 }
  // ];

  // public notasFiscaisCriadas=[
  //   {numeracao:'NF-5432', status:'Aberta',itens:[{codigo:'PROD-001',quantidade:2}]},
  //   {numeracao:'NF-8812', status:'Fechada',itens:[{codigo:'PROD-002',quantidade:1}]}
  // ]

  constructor() {
    this.notaForm = this.fb.group({
      
      numeracao: [{value:'Gerado automaticamente',disabled:true}],
      status: [{ value: 'Aberta', disabled: true }],
      produtos: this.fb.array([]) 
    }); 
    this.adicionarProduto();
  }

  ngOnInit(){
    this.carregarProdutosDoEstoque();
    this.carregarNotasDoFaturamento();
    this.adicionarProduto();
  }
  carregarProdutosDoEstoque(){
      this.http.get<any[]>('http://localhost:5100/api/produtos').subscribe({
      next: (dados) => {
        this.produtosDisponiveis = dados;
        console.log('Produtos atualizados carregados do estoque:', dados);
      },
      error: (erro) => {
        console.error('Erro ao buscar produtos do microsserviço de estoque:', erro);
      }
    });
  }
  carregarNotasDoFaturamento(){
    this.http.get<any[]>('http://localhost:5200/api/notas').subscribe({
      next: (dados) => this.notasFiscaisCriadas = dados,
      error: (erro) => console.error('Erro ao buscar notas:', erro)
    });
  }
  get listaProdutos(): FormArray {
    return this.notaForm.get('produtos') as FormArray;
  }
  
  adicionarProduto() {
    const produtoGrupo = this.fb.group({
      codigoProduto: ['', [Validators.required]], 
      quantidade: [1, [Validators.required, Validators.min(1)]]
    });
    this.listaProdutos.push(produtoGrupo);
  }

  removerProduto(index: number) {
    if (this.listaProdutos.length > 1) {
      this.listaProdutos.removeAt(index);
    }
  }

  salvarNota() {
     if (this.notaForm.valid) {
      const novaNotaPayload = {
        itens: this.listaProdutos.value 
      };

      this.http.post('http://localhost:5200/api/notas', novaNotaPayload).subscribe({
        next: () => {
          alert('Nota Fiscal criada com sucesso no banco de faturamento!');
          this.listaProdutos.clear();
          this.adicionarProduto();
          this.carregarNotasDoFaturamento(); 
          this.carregarProdutosDoEstoque(); 
        this.carregarNotasDoFaturamento();
        },
        error: (erro) => {
          console.error(erro);
          alert('Erro ao salvar a Nota Fiscal.');
        }
      });
    }
  }

  imprimirNota(nota:any){
    if (nota.status !== 'Aberta') {
      alert('Erro: Apenas notas com status Aberta podem ser impressas.');
      return;
    }

    this.processandoImpressao = true;
    this.notaSendoProcessada = nota.numeracao;

    
    this.http.put(`http://localhost:5200/api/notas/${nota.id}/imprimir`, {}).subscribe({
      next: () => {
        alert(`Nota ${nota.numeracao} impressa e FECHADA com sucesso!`);
        this.processandoImpressao = false;
        this.notaSendoProcessada = null;
        
        
        this.carregarProdutosDoEstoque();
        this.carregarNotasDoFaturamento();
      },
      error: (respostaErro) => {
        this.processandoImpressao = false;
        this.notaSendoProcessada = null;
        
        
        if (respostaErro.status === 503) {
          alert(` ATENÇÃO: Falha na operação!\n\nO Serviço de Estoque esta fora do ar ou indsponível no momento.\nA Nota Fiscal continuará em aberto e nenhum dado foi alterado.`);
        } else {
          alert('Ocorreu um erro inesperado ao tentar processar a nota.');
        }
        
        this.carregarNotasDoFaturamento(); 
      }
    });
  }
}