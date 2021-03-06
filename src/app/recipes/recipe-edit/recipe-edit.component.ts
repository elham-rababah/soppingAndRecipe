import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RecipeService } from '../recipe.service';
import * as RecipeActions from '../ngrx-store/recipes.actions';
import * as fromRecipe from '../ngrx-store/recipes.reducers';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css']
})
export class RecipeEditComponent implements OnInit {
  recipeId: number;
  editMode: boolean;
  recipeForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router,
    private store: Store<fromRecipe.RecipeState>
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.recipeId = params['id'];
      this.editMode = params['id'] != null; // if the id not exist this mean we want to add new recipe
      this.createForm();
    });
  }

  private createForm() {
    let resipeName = '';
    let resipeDescription = '';
    let resipeImagePath = '';
    let resipeIngredients = new FormArray([]);

    if (this.editMode) {
      // let resipe = this.recipeService.getRecipeByIndex(this.recipeId);
      this.store.select('recipes').subscribe((recipes) => {
        const resipe = recipes.recipes[this.recipeId];
        resipeName = resipe.name;
        resipeDescription = resipe.description;
        resipeImagePath = resipe.imagePath;
        if (resipe.ingredients.length) {
          for (let ing of resipe.ingredients) {
            resipeIngredients.push(
              new FormGroup({
                name: new FormControl(ing.name, [Validators.required]),
                amount: new FormControl(ing.amount, [Validators.required])
              })
            );
          }
        }
      });
    }
    this.recipeForm = new FormGroup({
      name: new FormControl(resipeName, [Validators.required]),
      description: new FormControl(resipeDescription, [Validators.required]),
      imagePath: new FormControl(resipeImagePath, [Validators.required]),
      ingredients: resipeIngredients
    });

  }

  addIngredieant() {
    (<FormArray>this.recipeForm.get('ingredients')).push(
      new FormGroup({
        name: new FormControl('', [Validators.required]),
        amount: new FormControl('', [Validators.required])
      })
    );
  }

  onSubmit() {
    if (this.editMode) {
      this.store.dispatch(new RecipeActions.EditRecipe({ index: this.recipeId, updatedRecipe: this.recipeForm.value }));
    } else {
      this.store.dispatch(new RecipeActions.AddRecipe(this.recipeForm.value));
      this.recipeForm.reset();
    }
    this.onCancle();
  }

  onCancle() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  deleteIngredieant(index: number) {
    (<FormArray>this.recipeForm.get('ingredients')).removeAt(index);
  }
}
