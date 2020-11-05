## Translations

To update a translation or add new language

Fork this repo as usual

```shell
# enter in project folder
cd django-file-form

# create virtualenv (example using pipenv)
pipenv install --python=3 -r testproject/requirements.txt

# enter in venv shell
pipenv shell

# update po file for your language
django-admin makemessages -l fr
```

You can now edit generated po file and commit your changes as usual
