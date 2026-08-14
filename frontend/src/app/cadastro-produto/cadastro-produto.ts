import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './cadastro-produto.html',        
  styleUrl: './cadastro-produto.css'             
})
export class CadastroProduto {
  private fb = inject(FormBuilder);
  private http=inject(HttpClient);

  public produtoForm: FormGroup;

  constructor() {
    this.produtoForm = this.fb.group({
      codigo: ['', [Validators.required]],
      descricao: ['', [Validators.required, Validators.minLength(3)]],
      saldo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  salvarProduto() {
    if (this.produtoForm.valid) {
      const dadosProduto=this.produtoForm.value

      this.http.post('http://localhost:5100/api/produtos', dadosProduto)
        .subscribe({
          next:(resposta)=>{
            console.log('Salvo no sqlLite com sucesso',resposta)
            alert('Produto cadastrado e persistido com sucesso no banco de dados')
            this.produtoForm.reset({saldo:0})
          },
          error:(err)=>{
            console.error('Erro ao tentar salvar',err)
            alert('Falha ao tentar conectar com o microsserviço de estoque. Verifique se o CSharp esta rodando...')
          
          }
        })

     
    }
  }
}
