# Releasing a new version

Releases are published to PyPI by the `Release` GitHub Actions workflow
(`.github/workflows/release.yml`). Pushing a version tag is all that is needed;
nothing is built or uploaded from a developer machine.

## One-time setup

The release requires a trusted publisher setup on pypi.org.

## Release steps

1. Make sure `master` is green in CI.
2. Update the version in `pyproject.toml`:

   ```toml
   version = "5.0.1"
   ```

3. Add an entry at the top of `docs/changelog.md`, following the existing
   format:

   ```markdown
   **5.0.1 (september 20 2026)**

   - Issue #1234: describe the change.
   ```

4. If support for a Django or Python version was added or dropped, also update:
   - the classifiers in `pyproject.toml`
   - the supported versions in `docs/index.md`
   - the Django matrix in `.github/workflows/ci.yml`
5. Commit and push to `master`, and wait for CI to pass.
6. Tag the commit and push the tag. The tag must be exactly the version
   number, without a `v` prefix:

   ```sh
   git tag 5.0.1
   git push origin 5.0.1
   ```

7. Follow the _Release_ workflow under the _Actions_ tab. If the `pypi`
   environment has a required reviewer, approve the _Publish to PyPI_ job when
   it asks.
8. Check the new version on
   [pypi.org/project/django-file-form](https://pypi.org/project/django-file-form/)
   and the release under _Releases_ on GitHub.

The documentation site is deployed separately from `master` by the
`Publish docs via GitHub Pages` workflow, so the changelog appears online as
soon as step 5 is pushed.

## What the workflow does

1. **Build**: checks that the tag equals the version in `pyproject.toml`,
   rebuilds the javascript bundle with `npm run build`, builds the wheel and
   sdist with `python -m build`, and validates them with `twine check`.
2. **Publish to PyPI**: uploads the wheel and sdist using trusted publishing.
3. **Create GitHub release**: creates a release for the tag with
   auto-generated notes and the built files attached.

## Package contents

`MANIFEST.in` controls which non-python files end up in the package. The
templates, the built javascript and css in `django_file_form/static`, and the
translations in `django_file_form/locale` are included. The coverage
instrumented bundle (`file_form.coverage.js`) is excluded because it is only
used by the test suite.

To check the contents of a build locally:

```sh
pip install build
python -m build
unzip -l dist/*.whl
```

## Troubleshooting

**The build job fails with "Tag ... does not match version ..."**

The version in `pyproject.toml` was not bumped, or the tag has a typo. Delete
the tag, fix the problem, and tag again:

```sh
git tag -d 5.0.1
git push origin :refs/tags/5.0.1
```

**The publish job fails with an authentication error**

The trusted publisher on PyPI does not match the workflow. Check that the
workflow file name and the environment name in the PyPI settings are exactly
`release.yml` and `pypi`.
