import { UploadedFile } from "../models/data.model";

enum RequestStatusEnum {
    PENDING = 'pending',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}

enum SortOptionsEnum {
    DEFAULT = 'Default',
    ASCENDING = 'Ascending',
    DESCENDING = 'Descending'
}

const SortOptions = [
    SortOptionsEnum.DEFAULT,
    SortOptionsEnum.ASCENDING,
    SortOptionsEnum.DESCENDING
];

enum FiltersEnum {
    HIDE_NEGLECTABLE,
    CATEGORY_SORT
}

class ConstsHelper {
    public static historyFiles: UploadedFile[] = []
}

export {
    RequestStatusEnum,
    SortOptionsEnum,
    SortOptions,
    FiltersEnum,
    ConstsHelper
}
