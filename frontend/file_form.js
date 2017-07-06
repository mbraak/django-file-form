/* global $ */

function initUploadFields($form, options) { // eslint-disable-line no-unused-vars
    const csrf_token = $form.find("[name=csrfmiddlewaretoken]").val();

    const upload_url = $form.find("[name=upload_url]").val();
    if (!upload_url) {
        console.warn("upload_url field is empty; aborting initialization");
        return;
    }

    const delete_url = $form.find("[name=delete_url]").val();

    const form_id = $form.find("[name=form_id]").val();
    if (!form_id) {
        console.warn("form_id field is empty; aborting initialization");
        return;
    }

    $form.find(".file-uploader").each(
        (i, element) => {
            const $element = $(element);

            const $input_file = $($element.find("input[type=file]"));
            const container = $element.find(".file-uploader-container");

            const field_name = $input_file.attr("name");
            const multiple = !!$input_file.attr("multiple");

            const uploader_options = {
                element: container,
                field_name,
                csrf_token,
                upload_url,
                delete_url,
                form_id,
                multiple
            };

            if (options) {
                $.extend(uploader_options, options);
            }

            if (!multiple) {
                $(container).on("complete", () => {
                    $($element.find(".existing-files")).remove();
                });
            }

            initFileUploader(uploader_options);
        }
    );
}

function initFileUploader(options) {
    const $container = $(options.element);

    const uploader_options = {
        request: {
            endpoint: options.upload_url,
            params: {
                csrfmiddlewaretoken: options.csrf_token,
                field_name: options.field_name,
                form_id: options.form_id
            }
        },
        multiple: options.multiple,
        deleteFile: {
            enabled: true,
            endpoint: options.delete_url,
            method: "POST",
            customHeaders: {
                "X-CSRFToken": options.csrf_token
            }
        },
        failedUploadTextDisplay: {
            maxChars: 100,
            responseProperty: "error",
            enableTooltip: true
        }
    };

    if (options.text) {
        uploader_options.text = options.text;
    }

    if (options.deleteFile) {
        $.extend(uploader_options.deleteFile, options.deleteFile);
    }

    if (options.failedUploadTextDisplay) {
        $.extend(uploader_options.failedUploadTextDisplay, options.failedUploadTextDisplay);
    }

    if (options.callbacks) {
        uploader_options.callbacks = options.callbacks;
    }

    if (options.template) {
        uploader_options.template = options.template;
    }

    if (options.validation) {
        uploader_options.validation = options.validation;
    }

    $container.fineUploader(uploader_options);

    const files_data = $container.data("files");

    if (files_data) {
        files_data.forEach(
            value => {
                if (!value.existing) {
                    $container.fineUploader(
                        "addCannedFile",
                        {
                            uuid: value.id,
                            name: value.name
                        }
                    );
                }
            }
        );
    }
}
