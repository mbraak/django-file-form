const form = document.getElementById("wizard-form");
const step = form.querySelector(
  `[name="wizard_example_view-current_step"]`
).value;

if (step === "0") {
  initUploadFields(form, {
    prefix: step,
    retryDelays: [],
    skipRequired: true,
    supportDropArea: true,
  });
}
