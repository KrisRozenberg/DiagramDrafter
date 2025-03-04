import { createAction, props } from "@ngrx/store";
import { FiltersEnum, SortOptionsEnum } from "../../helpers/constants";

export const hideNeglectable = createAction(
    '[Dashboard Page] Hide Neglectable (Close to 0) Categories',
    props<{ hide: boolean }>()
);

export const categorySort = createAction(
    '[Dashboard Page] Sort Data by Category',
    props<{ sort: SortOptionsEnum }>()
);