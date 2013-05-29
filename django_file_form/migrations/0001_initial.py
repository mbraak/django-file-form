# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration


class Migration(SchemaMigration):
    def forwards(self, orm):
        # Adding model 'UploadedFile'
        db.create_table(u'django_file_form_uploadedfile', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('created', self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime.now)),
            ('uploaded_file', self.gf('django.db.models.fields.files.FileField')(max_length=255)),
            ('field_name', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('file_id', self.gf('django.db.models.fields.CharField')(max_length=40)),
            ('form_id', self.gf('django.db.models.fields.CharField')(max_length=40)),
        ))
        db.send_create_signal(u'django_file_form', ['UploadedFile'])

    def backwards(self, orm):
        # Deleting model 'UploadedFile'
        db.delete_table(u'django_file_form_uploadedfile')

    models = {
        u'django_file_form.uploadedfile': {
            'Meta': {'object_name': 'UploadedFile'},
            'created': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'field_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'file_id': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            'form_id': ('django.db.models.fields.CharField', [], {'max_length': '40'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'uploaded_file': ('django.db.models.fields.files.FileField', [], {'max_length': '255'})
        }
    }

    complete_apps = ['django_file_form']