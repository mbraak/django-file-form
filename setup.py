from setuptools import setup, find_packages


version = '0.1.4.5'

setup(
    name='django-file-form',
    version=version,
    packages=find_packages(),
    license='Apache License, Version 2.0',
    include_package_data=True,
    zip_safe=False,
    author='Marco Braak',
    author_email='mbraak@ridethepony.nl',
    description='Django-file-form helps you to write forms with a pretty ajax upload',
    install_requires=['ajaxuploader==0.3.0.3', 'six', 'path.py'],
    dependency_links=[
        'https://github.com/mbraak/django-ajax-uploader/archive/0.3.0.3.tar.gz#egg=ajaxuploader-0.3.0.3',
    ]
)
