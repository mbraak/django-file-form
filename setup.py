from setuptools import setup, find_packages


version = '0.4.1'

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
    url='https://github.com/mbraak/django-file-form',
    install_requires=['six', 'pathlib'],
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: Apache Software License",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy"
    ]
)
