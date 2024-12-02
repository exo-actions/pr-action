# eXo PR Builds Action

Build Maven project using Github Actions

Usage example:

```yaml
name: PR Build
on:
  push:
jobs:
  build-ci:
    name: CI Build
    runs-on: ubuntu-latest
    timeout-minutes: 120
    permissions:
      pull-requests: write
    steps:
      - name: PR BUILD
        uses: exo-actions/pr-action@v1
        with:
          maven_version: "3.9.9"
          jdk_major_version: "21"
          jdk_distribution: "zulu"
```