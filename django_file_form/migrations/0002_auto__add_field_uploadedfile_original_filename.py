# -*- coding: utf-8 -*-
from south.db import db
from south.v2 import SchemaMigration


class Migration(SchemaMigration):
    def forwards(self, orm):
        # Adding field 'UploadedFile.original_filename'
        db.add_column(u'django_file_form_uploadedfile', 'original_filename',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=255),
                      keep_default=False)

    def backwards(self, orm):
        # Deleting field 'UploadedFile.original_filename'
        db.delete_column(u'django_file_form_uploadedfile', 'original_filename')

    models = {
        u'django_file_form.uploadedfile': {
            'Meta': {'object_name': 'UploadedFile'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'field_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'file_id': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'form_id': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'original_filename': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'uploaded_file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['django_file_form']