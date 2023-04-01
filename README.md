<p align="center">
  <a href="https://github.com/Kaosumaru/plastic-scm-build-info-action/actions"><img alt="typescript-action status" src="https://github.com/Kaosumaru/plastic-scm-build-info-action/workflows/build-test/badge.svg"></a>
</p>


# plastic-scm-build-info-action
TODO
WARNING: this action requires cm to be installed on the runner


# Inputs

## ``repository``
Required: **YES**.

Name of repository to checkout

## ``branch``
Required: **NO**

Branch to checkout, defaults to "/main"


# Usage Example

## Simple Workflow

```yaml
# .github/workflows/main.yml
name: Main
on: [push]

jobs:
  my_job:
    runs-on: ubuntu-latest

    steps:
      - name: Plastic checkout
        uses: Kaosumaru/plastic-scm-build-info@v1
        with:
          repository: test@test@test
          branch: /main     
```
