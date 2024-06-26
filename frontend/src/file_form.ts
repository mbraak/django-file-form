import autoInitFileForms from "./auto_init_file_forms.ts";
import initFormSet from "./init_form_set.ts";
import initUploadFields from "./init_upload_fields.ts";

declare const window: any; // eslint-disable-line @typescript-eslint/no-explicit-any

window.autoInitFileForms = autoInitFileForms; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
window.initFormSet = initFormSet; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
window.initUploadFields = initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access
