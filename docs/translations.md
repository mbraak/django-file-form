## Translations

To update a translation or add new language

Fork this repo as usual

```shell
# enter in project folder
cd django-file-form

# create the virtualenv (requires uv: https://docs.astral.sh/uv/)
uv sync

# update po file for your language
uv run django-admin makemessages -l fr
```

You can now edit the generated `.po` file and commit your changes as usual
