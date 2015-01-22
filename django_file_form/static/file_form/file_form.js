function initUploadFields($form, options) {
    var csrf_token = $form.find('[name=csrfmiddlewaretoken]').val();
    var upload_url = $form.find('[name=upload_url]').val();
    var delete_url = $form.find('[name=delete_url]').val();
    var form_id = $form.find('[name=form_id]').val();

    $form.find('.file-uploader').each(
        function(i, element) {
            var $element = $(element);

            var $input_file = $($element.find('input[type=file]'));
            var container = $element.find('.file-uploader-container');

            var field_name = $input_file.attr('name');
            var multiple = !! $input_file.attr('multiple');

            var uploader_options = {
                element: container,
                field_name: field_name,
                csrf_token: csrf_token,
                upload_url: upload_url,
                delete_url: delete_url,
                form_id: form_id,
                multiple: multiple
            };

            if (options) {
                $.extend(uploader_options, options);
            }

            if (! multiple) {
                $(container).on('complete', function() {
                    $($element.find('.existing-files')).remove();
                });
            }

            initFileUploader(uploader_options);
        }
    );
}

function initFileUploader(options) {
    var $container = $(options.element);

    var uploader_options = {
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
            method: 'POST',
            customHeaders: {
                "X-CSRFToken": options.csrf_token
            }
        },
        failedUploadTextDisplay: {
            maxChars: 100,
            responseProperty: 'error',
            enableTooltip: true
        }
    };

    if (options.text) {
        uploader_options['text'] = options.text;
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
        uploader_options.validation= options.validation;
    }

    $container.fineUploader(uploader_options);

    var files_data = $container.data('files');
    if (files_data) {
        $.each(
            files_data,
            function(index, value) {
                if (! value.existing) {
                    $container.fineUploader(
                        'addCannedFile',
                        {
                            uuid: value['id'],
                            name: value['name']
                        }
                    );
                }
            }
        );
    }
}
