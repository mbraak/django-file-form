/* global $ */

function initUploadFields($form, options) {
    const csrfToken = $form.find("[name=csrfmiddlewaretoken]").val();

    const getInputNameWithPrefix = fieldName =>
        options && options.prefix
            ? `${options.prefix}-${fieldName}`
            : fieldName;

    const getInputValue = fieldName => {
        const inputNameWithPrefix = getInputNameWithPrefix(fieldName);
        const input = $form.find(`[name=${inputNameWithPrefix}]`);

        if (!input.length) {
            console.error(
                `Cannot find input with name '${inputNameWithPrefix}'`
            );
            return null;
        }

        return input.val();
    };

    const uploadUrl = getInputValue("upload_url");
    const deleteUrl = getInputValue("delete_url");
    const formId = getInputValue("form_id");

    if (!formId || !uploadUrl) {
        return;
    }

    $form.find(".file-uploader").each((i, element) => {
        const $element = $(element);

        const $inputFile = $($element.find("input[type=file]"));
        const container = $element.find(".file-uploader-container");

        const fieldName = $inputFile.attr("name");
        const multiple = Boolean($inputFile.attr("multiple"));

        const uploaderOptions = {
            element: container,
            fieldName,
            csrfToken,
            uploadUrl,
            deleteUrl,
            formId,
            multiple
        };

        if (options) {
            $.extend(uploaderOptions, options);
        }

        if (!multiple) {
            $(container).on("complete", () => {
                $($element.find(".existing-files")).remove();
            });
        }

        initFileUploader(uploaderOptions);
        $inputFile.remove();
    });
}

function initFileUploader(options) {
    const $container = $(options.element);

    const uploaderOptions = {
        request: {
            endpoint: options.uploadUrl,
            params: {
                csrfmiddlewaretoken: options.csrfToken,
                field_name: options.fieldName,
                form_id: options.formId
            }
        },
        multiple: options.multiple,
        deleteFile: {
            enabled: true,
            endpoint: options.deleteUrl,
            method: "POST",
            customHeaders: {
                "X-CSRFToken": options.csrfToken
            }
        },
        failedUploadTextDisplay: {
            maxChars: 100,
            responseProperty: "error",
            enableTooltip: true
        }
    };

    if (options.text) {
        uploaderOptions.text = options.text;
    }

    if (options.deleteFile) {
        $.extend(uploaderOptions.deleteFile, options.deleteFile);
    }

    if (options.failedUploadTextDisplay) {
        $.extend(
            uploaderOptions.failedUploadTextDisplay,
            options.failedUploadTextDisplay
        );
    }

    if (options.callbacks) {
        uploaderOptions.callbacks = options.callbacks;
    }

    if (options.template) {
        uploaderOptions.template = options.template;
    }

    if (options.validation) {
        uploaderOptions.validation = options.validation;
    }

    $container.fineUploader(uploaderOptions);

    const filesData = $container.data("files");

    if (filesData) {
        filesData.forEach(value => {
            if (!value.existing) {
                $container.fineUploader("addCannedFile", {
                    uuid: value.id,
                    name: value.name
                });
            }
        });
    }
}

global.initUploadFields = initUploadFields;
