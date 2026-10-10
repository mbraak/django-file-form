import autoInitFileForms from "./auto_init_file_forms.ts";
import initFormSet from "./init_form_set.ts";
import initUploadFields from "./init_upload_fields.ts";

declare global {
  interface Window {
    autoInitFileForms: typeof autoInitFileForms;
    initFormSet: typeof initFormSet;
    initUploadFields: typeof initUploadFields;
  }
}

window.autoInitFileForms = autoInitFileForms;
window.initFormSet = initFormSet;
window.initUploadFields = initUploadFields;
