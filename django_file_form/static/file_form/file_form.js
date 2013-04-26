function initUploadFields($form) {
    var csrf_token = $form.find('[name=csrfmiddlewaretoken]').val();
    var upload_url = $form.find('[name=upload_url]').val();
    var delete_url = $form.find('[name=delete_url]').val();
    var form_id = $form.find('[name=form_id]').val();

    $form.find('.upload-container').each(
        function(i, element) {
            var $input_file = $(element).find('input[type=file]');
            var field_name = $input_file.attr('name');
            var multiple = !! $input_file.attr('multiple');

            initFileUploader(element, field_name, csrf_token, upload_url, delete_url, form_id, multiple);
        }
    );
}

function initFileUploader(element, field_name, csrf_token, upload_url, delete_url, form_id, multiple) {
    var $container = $(element);

    $container.fineUploader({
        request: {
            endpoint: upload_url,
            params: {
                csrfmiddlewaretoken: csrf_token,
                field_name: field_name,
                form_id: form_id
            }
        },
        multiple: multiple,
        deleteFile: {
            enabled: true,
            endpoint: delete_url,
            customHeaders: {
                X_CSRFTOKEN: csrf_token
            }
        }
    });

    var files_data = $container.data('files');
    if (files_data) {
        $.each(
            files_data,
            function(index, value) {
                $container.fineUploader('addExistingFile', value['id'], value['name']);
            }
        );
    }
}

qq.FineUploader.prototype.addExistingFile = function(uuid, name) {
    var id = this._handler.addExistingFile(uuid, name);

    var item = qq.toElement(this._options.fileTemplate);
    item.qqFileId = id;

    qq(this._find(item, 'cancel')).remove();
    qq(item).addClass(this._classes.success);

    var fileElement = this._find(item, 'file');
    qq(fileElement).setText(this._options.formatFileName(name));
    qq(this._find(item, 'size')).hide();
    qq(this._find(item, 'spinner')).hide();

    this._listElement.appendChild(item);

    if (this._isDeletePossible()) {
        this._showDeleteLink(id);
    }
}