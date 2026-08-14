import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importações obrigatórias
  templateUrl: './cadastro-produto.html',        // Nome ajustado para sua estrutura
  styleUrl: './cadastro-produto.css'             // Nome ajustado para sua estrutura
})
export class CadastroProduto {
  private fb = inject(FormBuilder);
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
      console.log('Dados do produto:', this.produtoForm.value);
      alert('Produto validado com sucesso no front!');
      this.produtoForm.reset({ saldo: 0 });
    }
  }
}
