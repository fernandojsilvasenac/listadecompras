import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastProvider } from './../../../providers/toast/toast';
import { ProdutosProvider } from '../../../providers/produtos/produtos';
import { CategoriasProvider } from './../../../providers/categorias/categorias';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-edit-produtos',
  templateUrl: 'edit-produtos.html',
})
export class EditProdutosPage {
  title: string;
  form: FormGroup;
  categories: Observable<any>;
  produtos: any;
  hasImg = false;
  private file: File = null;
  categoriaItem:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private formBuilder: FormBuilder, private toast: ToastProvider,
              private produtosProvider: ProdutosProvider, private categoriasProvider: CategoriasProvider) {
                this.produtos = this.navParams.data.produtoKey|| {};
                console.log(this.produtos);
                this.SetupPageTitle();
                this.createForm();
                this.loadCategories();

                const subscribe = this.produtosProvider.get(this.navParams.data.produtoKey).subscribe((produtosData: any) => {
                  subscribe.unsubscribe();
                  this.produtos = produtosData;
                  console.log(this.produtos);
                  this.createForm();
                });

                this.hasImg = this.produtos.imgUrl != '';


  }

  private SetupPageTitle(){
    if (this.navParams.data.produto){
      this.title = 'Alterando produtos';
    } else {
      this.title = 'Novo produto';
    }
  }

  private createForm(){
    this.form = this.formBuilder.group({
      key: [this.produtos.key],
      name: [this.produtos.name, Validators.required],
      description: [this.produtos.description],
      price: [this.produtos.price, Validators.required],
      categoryKey: [this.produtos.categoryKey, Validators.required],
      categoryName: [this.produtos.categoryName],
      imgUrl: [this.produtos.imgUrl],
      img:[this.produtos.img],
    })
  }

  onSubmit(){
    if (this.form.valid) {
      this.produtosProvider.save(this.form.value, this.file);
      this.toast.show('Produtos salvo com sucesso');
      // this.toast.create({ message: 'Categoria salva com sucesso', duration: 3000}).present();
      this.navCtrl.pop();
    }
  }

  private loadCategories() {
    this.categories = this.categoriasProvider.getAll();
  }

  getCategorias() {
    const subscribe = this.categoriasProvider.get(this.form.value.categoryKey).subscribe((categoriasData: any) => {
      subscribe.unsubscribe();
      this.categoriaItem = categoriasData;
      console.log(this.categoriaItem);
      this.form.controls['categoryName'].setValue(this.categoriaItem.nome);
      console.log(this.categoriaItem.name);
    });
  }


  fileEvent(fileInput: any) {
    this.file = null;

    if (fileInput.target.files.length) {
      this.file = fileInput.target.files[0];
      this.form.controls['img'].updateValueAndValidity();

      if (['image/png', 'image/jpeg'].indexOf(this.file.type) < 0) {
        this.form.controls['img'].setErrors({ 'imgType': true });
      }
    }
  }

  removeImg() {
    this.form.controls['imgUrl'].setValue('');
    this.hasImg = false;
    if (this.form.value.key) {
      this.produtosProvider.removeImgOfProduct(this.form.value.key);
    }
  }

}
